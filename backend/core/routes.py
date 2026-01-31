from flask import request, jsonify
from werkzeug.security import generate_password_hash,check_password_hash
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import create_access_token,jwt_required,get_jwt_identity,get_jwt,verify_jwt_in_request
from core.models import db, User,Topic,Question,AnswerOption
from functools import wraps
from core import abstract_app,jwt,jwt_blacklist
from datetime import timedelta

import logging

app = abstract_app

def role_required(required_role): 
    def wrapper(fn): 
        @wraps(fn) 
        def decorator(*args, **kwargs): 
            verify_jwt_in_request() 
            claims = get_jwt() 
            if claims.get("role") != required_role: 
                return jsonify({ "status": False, "error": f"Access denied: {required_role} role required" }), 403 
            return fn(*args, **kwargs) 
        return decorator 
    return wrapper

@app.route("/")
def home():
    return "Hello from the home route!"

@jwt.unauthorized_loader
def handle_missing_token(reason):
    return jsonify({"status": False, "error": f"Missing or invalid token: {reason}"}), 401

@jwt.invalid_token_loader
def handle_invalid_token(reason):
    return jsonify({"status": False, "error": f"Invalid token: {reason}"}), 422

def build_topic_tree(topic): 
    """Recursively build a nested dict for a topic and its subtopics.""" 
    return { "id": topic.topic_id,
            "name": topic.name, 
            "subtopics": [build_topic_tree(sub) for sub in topic.subtopics]
           }

@app.route("/topic", methods=["GET", "POST", "PUT", "DELETE"])
@role_required("admin")
def Topics():
    try:
        if request.method == "POST":
            # ✅ Create new topic
            payload = request.get_json(force=True, silent=True)
            if not payload:
                return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400

            nameTopic = payload.get("topicName")
            if not nameTopic:
                return jsonify({"status": False, "message": "Name of the topic required"}), 400

            topic = Topic.query.filter_by(name=nameTopic).first()
            if topic:
                logging.error("Topic already exists")
                return jsonify({"status": False, "message": "Topic already exists"}), 409

            new_topic = Topic(name=nameTopic, parent_topic=None)
            db.session.add(new_topic)
            db.session.commit()
            return jsonify({"status": True, "message": "New topic added successfully"}), 201

        elif request.method == "GET":
            # ✅ Retrieve all topics
            root_topics = Topic.query.filter_by(parent_topic=None).all() 
            nested = [build_topic_tree(t) for t in root_topics] 
            return jsonify({"status": True, "topics": nested}), 200

        elif request.method == "PUT":
            # ✅ Update topic
            payload = request.get_json(force=True, silent=True)
            if not payload:
                return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400

            topic_id = payload.get("id")
            new_name = payload.get("topicName")
            if not topic_id or not new_name:
                return jsonify({"status": False, "message": "Topic ID and new name required"}), 400

            topic = Topic.query.get(topic_id)
            if not topic:
                return jsonify({"status": False, "message": "Topic not found"}), 404

            topic.name = new_name
            db.session.commit()
            return jsonify({"status": True, "message": "Topic updated successfully"}), 200

        elif request.method == "DELETE":
            # ✅ Delete topic
            payload = request.get_json(force=True, silent=True)
            if not payload:
                return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400

            topic_id = payload.get("id")
            if not topic_id:
                return jsonify({"status": False, "message": "Topic ID required"}), 400

            topic = Topic.query.get(topic_id)
            if not topic:
                return jsonify({"status": False, "message": "Topic not found"}), 404

            db.session.delete(topic)
            db.session.commit()
            return jsonify({"status": True, "message": "Topic deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"status": False, "message": "Unexpected error occurred"}), 500

@app.route("/topic/<int:topic_id>", methods=["GET"])
@role_required("admin")
def get_single_topic(topic_id):
    try:
        topic = Topic.query.get(topic_id)
        if not topic:
            return jsonify({"status": False, "message": "Topic not found"}), 404

        # If you want nested children, reuse your build_topic_tree
        topic_data = build_topic_tree(topic)

        return jsonify({"status": True, "topic": topic_data}), 200

    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"status": False, "message": "Unexpected error occurred"}), 500
 

import json
import base64
from flask import request, jsonify

@app.route("/question", methods=["POST"])
@role_required("admin")
def create_question():
    try:
        # FormData fields
        statement = request.form.get("statement")   # question text
        topic_name = request.form.get("topic")      # optional topic name
        topic_id = request.form.get("topicId")      # numeric/string id
        correct_answer = request.form.get("correctAnswer")  # e.g. "B" or answer_id
        raw_options = request.form.get("options")   # JSON string of options {A: "...", B: "...", ...}

        # Validate required fields
        if not statement or not topic_id or not raw_options:
            return jsonify({"status": False, "message": "Statement, topicId, and options are required"}), 400

        # Handle image upload if present
        image_data = None
        mimetype = None
        if "image" in request.files:
            file = request.files["image"]
            mimetype = file.mimetype
            image_data = file.read()

        # Create new question
        new_question = Question(
            content=statement,
            topic_id=topic_id,
            correct_answer_id=None,  # will set later
            image_data=image_data,
            mimetype=mimetype
        )
        db.session.add(new_question)
        db.session.flush()  # get question_id before committing

        # Parse options (FormData sends as JSON string)
        try:
            options = json.loads(raw_options) if isinstance(raw_options, str) else raw_options
        except Exception:
            return jsonify({"status": False, "message": "Invalid options format"}), 400

        created_options = {}
        for key, text in options.items():  # keys like "A", "B", "C", "D"
            if not text:
                continue
            answer_option = AnswerOption(
                question_id=new_question.question_id,
                option_text=text
            )
            db.session.add(answer_option)
            db.session.flush()
            created_options[key] = answer_option.answer_id

        # Set correct answer if provided
        if correct_answer:
            # If correctAnswer is a letter (A/B/C/D), map to created option
            if correct_answer in created_options:
                new_question.correct_answer_id = created_options[correct_answer]
            else:
                # If it's already an answer_id, trust it
                try:
                    correct_id = int(correct_answer)
                    if correct_id in created_options.values():
                        new_question.correct_answer_id = correct_id
                except ValueError:
                    pass

        db.session.commit()

        return jsonify({
            "status": True,
            "message": "Question created successfully",
            "question_id": new_question.question_id
        }), 201

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating question: {str(e)}")
        return jsonify({"status": False, "message": "Error creating question"}), 500

@app.route("/questions", methods=["GET"])
@role_required("admin")
def get_all_questions():
    try:
        questions = Question.query.all()

        response = []
        for q in questions:
            question_data = {
                "question_id": q.question_id,
                "content": q.content,
                "topic_id": q.topic_id,
                "correct_answer_id": q.correct_answer_id,
            }
            response.append(question_data)

        return jsonify({"status": True, "questions": response}), 200

    except Exception as e:
        logging.error(f"Error retrieving questions: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving questions"}), 500

import base64

@app.route("/question/<int:question_id>", methods=["GET"])
@role_required("admin")
def get_question(question_id):
    try:
        question = Question.query.get(question_id)
        if not question:
            return jsonify({"status": False, "message": "Question not found"}), 404

        # Convert image to base64 if present
        image_base64 = None
        if question.image_data:
            image_base64 = base64.b64encode(question.image_data).decode("utf-8")

        # Map options into {A: {id, text}, B: {id, text}, ...}
        options_map = {}
        letters = ["A", "B", "C", "D"]
        for idx, opt in enumerate(question.answer_options):
            if idx < len(letters):
                options_map[letters[idx]] = {
                    "id": opt.answer_id,
                    "text": opt.option_text
                }

        # Resolve correct answer back to letter
        correct_letter = None
        for idx, opt in enumerate(question.answer_options):
            if opt.answer_id == question.correct_answer_id and idx < len(letters):
                correct_letter = letters[idx]

        response = {
            "statement": question.content,
            "topic": question.topic.name if question.topic else "",
            "topicId": question.topic_id,
            "correctAnswer": correct_letter,
            "image": image_base64,
            "mimetype": question.mimetype,
            "options": options_map
        }

        return jsonify({"status": True, "question": response}), 200

    except Exception as e:
        logging.error(f"Error retrieving question: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving question"}), 500


@app.route("/question", methods=["PUT"])
@role_required("admin")
def update_question():
    try:
        payload = request.form
        question_id = payload.get("id")
        if not question_id:
            return jsonify({"status": False, "message": "Question ID required"}), 400

        question = Question.query.get(question_id)
        if not question:
            return jsonify({"status": False, "message": "Question not found"}), 404

        # Update basic fields
        statement = payload.get("statement")
        topic_id = payload.get("topicId")
        correct_answer = payload.get("correctAnswer")
        raw_options = payload.get("options")

        if statement:
            question.content = statement
        if topic_id:
            question.topic_id = topic_id

        # Handle image logic
        if "image" in request.files:  # Scenario 2: new image uploaded
            file = request.files["image"]
            question.mimetype = file.mimetype
            question.image_data = file.read()
        elif payload.get("removeImage") == "true":  # Scenario 3: remove image
            question.image_data = None
            question.mimetype = None
        # Scenario 1: no image field → keep existing image

        # Update options if provided
        if raw_options:
            import json
            try:
                options = json.loads(raw_options) if isinstance(raw_options, str) else raw_options
            except Exception:
                return jsonify({"status": False, "message": "Invalid options format"}), 400

            for key, opt in options.items():
                opt_id = opt.get("id")
                new_text = opt.get("text")
                if opt_id and new_text:
                    existing_opt = AnswerOption.query.get(opt_id)
                    if existing_opt and existing_opt.question_id == question.question_id:
                        existing_opt.option_text = new_text

        # Update correct answer if provided
        if correct_answer:
            # If letter (A/B/C/D), map to option id
            if raw_options:
                options = json.loads(raw_options) if isinstance(raw_options, str) else raw_options
                if correct_answer in options:
                    question.correct_answer_id = options[correct_answer]["id"]
            else:
                try:
                    correct_id = int(correct_answer)
                    if any(opt.answer_id == correct_id for opt in question.answer_options):
                        question.correct_answer_id = correct_id
                except ValueError:
                    pass

        db.session.commit()
        return jsonify({"status": True, "message": "Question updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating question: {str(e)}")
        return jsonify({"status": False, "message": "Error updating question"}), 500


@app.route("/question", methods=["DELETE"])
@role_required("admin")
def delete_question():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400

        question_id = payload.get("id")
        if not question_id:
            return jsonify({"status": False, "message": "Question ID required"}), 400

        question = Question.query.get(question_id)
        if not question:
            return jsonify({"status": False, "message": "Question not found"}), 404

        # Delete all related options first
        for opt in question.answer_options:
            db.session.delete(opt)

        # Delete the question itself
        db.session.delete(question)
        db.session.commit()
        print("i have")
        return jsonify({"status": True, "message": "Question and its options deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error deleting question: {str(e)}")
        return jsonify({"status": False, "message": "Error deleting question"}), 500



@app.route("/subtopic", methods=["GET", "POST", "PUT", "DELETE"])
@role_required("admin")
def subTopics():
    try:
        if request.method == "POST":
            # ✅ Create new topic
            payload = request.get_json(force=True, silent=True)
            if not payload:
                return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400

            nameTopic = payload.get("subtopicName")
            parentTopic = payload.get("parentId")
            print(parentTopic)
            if not nameTopic:
                return jsonify({"status": False, "message": "Name of the sub topic required"}), 400

            topic = Topic.query.filter_by(name=nameTopic).first()
            if topic:
                logging.error("Topic already exists")
                return jsonify({"status": False, "message": "The sub topic already exists"}), 409

            new_topic = Topic(name=nameTopic, parent_topic=int(parentTopic))
            db.session.add(new_topic)
            db.session.commit()
            return jsonify({"status": True, "message": "New subtopic added successfully"}), 201
   
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"status": False, "message": "Unexpected error occurred"}), 500



@app.route("/users", methods=["GET"])
def get_all_users():
    try:
        questions = User.query.all()

        response = []
        for q in questions:
            question_data = {
                "id": q.id,
                "email": q.email,
                "role": q.role,
            }
            response.append(question_data)

        return jsonify({"status": True, "users": response}), 200

    except Exception as e:
        logging.error(f"Error retrieving questions: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving questions"}), 500


@app.route("/me", methods=["GET"])
@jwt_required()
def me(): 
    user_id = get_jwt_identity() 
    # returns 'sub' → user.id 
    claims = get_jwt() # returns full payload 
    return jsonify({ "status": True, "data": { "id": user_id, "email": claims["email"], "role": claims["role"] } })

@app.route("/register", methods=["POST"])
def register():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400

        email = payload.get("email", "").strip().lower()
        password = payload.get("password")

        # Basic input validation
        if not email or not password:
            return jsonify({"status": False, "message": "Email and password are required"}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"status": False, "message": "A user with this email already exists"}), 500

        # Hash the password securely
        hashed_password = generate_password_hash(password)

        # Create new user
        new_user = User(
            email=email,
            password=hashed_password,
            role="client"  # or default role logic
        )

        db.session.add(new_user)
        db.session.commit()
        print("Registration successful: Email =",email," password = ",password )
        return jsonify({"status": True, "message": "Registration successful"}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500

    except Exception as e:
        return jsonify({"status": False, "message": "Unexpected error occurred"}), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400

        email = payload.get("email", "").strip().lower()
        password = payload.get("password")
        print("My credentials: Email =",email," password = ",password )
        # Basic input validation
        if not email or not password:
            return jsonify({"status": False, "message": "Email and password are required"}), 400

        # Look up user
        user = User.query.filter_by(email=email).first()

        if not user or not check_password_hash(user.password, password):
            logging.warning(f"Login failed for email: {email}")
            return jsonify({"status": False, "message": "Invalid credentials"}), 401
      

        # Generate JWT token
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"email": user.email, "role": user.role}
        )

        return jsonify({
            "status": True,
            "token": access_token,
            "role": user.role
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"status": False, "message": "Unexpected error occurred"}), 500
    


# In-memory token blacklist (for demo purposes; use Redis/DB in production)


@app.route("/logout", methods=["GET"])
@jwt_required()
def logout():
    try:
        jti = get_jwt()["jti"]  # JWT ID, unique identifier for the token
        jwt_blacklist.add(jti)

        return jsonify({"status": True, "message": "Successfully logged out"}), 200

    except Exception as e:
        logging.error(f"Logout error: {str(e)}")
        return jsonify({"status": False, "message": "Logout failed"}), 500


     
        


