from flask import request, jsonify
from werkzeug.security import generate_password_hash,check_password_hash
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import create_access_token,jwt_required,get_jwt_identity,get_jwt,verify_jwt_in_request
from core.models import db, User,Topic,Question,AnswerOption,Quiz,QuizQuestion
from functools import wraps
from core import abstract_app,jwt,jwt_blacklist
from datetime import timedelta,datetime
import base64
import random
from collections import defaultdict, deque

import logging

app = abstract_app

def role_required(required_roles):
    # Normalize input → always treat as a list
    if isinstance(required_roles, str):
        required_roles = [required_roles]

    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")

            if user_role not in required_roles:
                return jsonify({
                    "status": False,
                    "error": f"Access denied: requires one of {required_roles}"
                }), 403

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
 


@app.route("/question", methods=["POST"])
@role_required("admin")
def create_question():
    import json
   

    try:
     
        statement = request.form.get("statement")
        topic_id = request.form.get("topicId")
        correct_answer = request.form.get("correctAnswer")
        raw_options = request.form.get("options")

        # 2. Precise Validation (Preventing the 400 error)
        if not statement:
            logging({"status": False, "message": "Statement is missing"})
            return jsonify({"status": False, "message": "Statement is missing"}), 400
        if topic_id is None:
            logging({"status": False, "message": "topicId is missing"})
            return jsonify({"status": False, "message": "topicId is missing"}), 400
        if not raw_options:
            logging({"status": False, "message": "Options JSON string is missing"})
            return jsonify({"status": False, "message": "Options JSON string is missing"}), 400

        # 3. Handle image upload
        image_data = None
        mimetype = None
        if "image" in request.files:
            file = request.files["image"]
            mimetype = file.mimetype
            image_data = file.read()

        # 4. Create Question Instance
        # topic_id cast to int ensures DB compatibility
        new_question = Question(
            content=statement,
            topic_id=int(topic_id),
            correct_answer_id=None,
            image_data=image_data,
            mimetype=mimetype
        )
        db.session.add(new_question)
        db.session.flush()

        # 5. Parse and Create Options
        try:
            options = json.loads(raw_options) if isinstance(raw_options, str) else raw_options
        except (json.JSONDecodeError, TypeError) as e:
            return jsonify({"status": False, "message": f"Invalid options format: {str(e)}"}), 400

        created_options = {}
        for key, text in options.items():
            if not text:
                continue
            answer_option = AnswerOption(
                question_id=new_question.question_id,
                option_text=text
            )
            db.session.add(answer_option)
            db.session.flush()
            created_options[key] = answer_option.answer_id

        # 6. Map Correct Answer
        if correct_answer:
            # Handle letter mapping (A, B, C, D)
            if correct_answer in created_options:
                new_question.correct_answer_id = created_options[correct_answer]
            else:
                # Fallback if an ID was sent directly
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
        return jsonify({"status": False, "message": f"Server error: {str(e)}"}), 500


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



@app.route("/question/<int:question_id>", methods=["GET"])
@role_required(["admin","client"])
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


@app.route("/quiz", methods=["POST"])
@role_required("admin")
def create_quiz():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400

        title = payload.get("title")
        description = payload.get("description")
        question_ids = payload.get("questions")

        if not title or not description or not question_ids:
            return jsonify({"status": False, "message": "Title, description, and questions are required"}), 400

        # Create quiz
        new_quiz = Quiz(
            title=title,
            description=description,
            publish_date=datetime.utcnow()
        )
        db.session.add(new_quiz)
        db.session.flush()  # get quiz_id before committing

        # Link questions
        for q_id in question_ids:
            question = Question.query.get(q_id)
            if not question:
                return jsonify({"status": False, "message": f"Question {q_id} not found"}), 404

            quiz_question = QuizQuestion(
                quiz_id=new_quiz.quiz_id,
                question_id=q_id
            )
            db.session.add(quiz_question)

        db.session.commit()

        return jsonify({
            "status": True,
            "message": "Quiz created successfully",
            "quiz_id": new_quiz.quiz_id
        }), 201

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating quiz: {str(e)}")
        return jsonify({"status": False, "message": "Error creating quiz"}), 500


@app.route("/quiz", methods=["PUT"])
@role_required("admin")
def update_quiz():
    
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400

        quiz_id = payload.get("quiz_id")
        title = payload.get("title")
        description = payload.get("description")
        question_ids = payload.get("questions")

        if not quiz_id or not title or not description or not question_ids:
            return jsonify({"status": False, "message": "quiz_id, title, description, and questions are required"}), 400

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({"status": False, "message": "Quiz not found"}), 404

        # Update quiz metadata
        quiz.title = title
        quiz.description = description

        # Delete existing quiz-question links
        QuizQuestion.query.filter_by(quiz_id=quiz_id).delete()

        # Insert new quiz-question links
        for q_id in question_ids:
            question = Question.query.get(q_id)
            if not question:
                return jsonify({"status": False, "message": f"Question {q_id} not found"}), 404

            quiz_question = QuizQuestion(
                quiz_id=quiz_id,
                question_id=q_id
            )
            db.session.add(quiz_question)

        db.session.commit()

        return jsonify({
            "status": True,
            "message": "Quiz updated successfully",
            "quiz_id": quiz.quiz_id
        }), 200

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating quiz: {str(e)}")
        return jsonify({"status": False, "message": "Error updating quiz"}), 500


@app.route("/quiz", methods=["DELETE"])
@role_required("admin")
def delete_quiz():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400

        quiz_id = payload.get("id")
        if not quiz_id:
            return jsonify({"status": False, "message": "Quiz ID required"}), 400

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({"status": False, "message": "Quiz not found"}), 404

        # Delete all quiz-question links first
        QuizQuestion.query.filter_by(quiz_id=quiz_id).delete()

        # Delete the quiz itself
        db.session.delete(quiz)
        db.session.commit()

        return jsonify({"status": True, "message": "Quiz deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error deleting quiz: {str(e)}")
        return jsonify({"status": False, "message": "Error deleting quiz"}), 500


@app.route("/quizzes", methods=["GET"])
@role_required(["admin","client"])
def get_all_quizzes():
    try:
        quizzes = Quiz.query.all()

        response = []
        for quiz in quizzes:
            quiz_data = {
                "quiz_id": quiz.quiz_id,
                "title": quiz.title,
                "description": quiz.description,
                "publish_date": quiz.publish_date.isoformat() if quiz.publish_date else None,
                "questions": [
                    {
                        "question_id": qq.question.question_id,
                        "statement": qq.question.content,
                        "topicId": qq.question.topic_id,
                        "correctAnswerId": qq.question.correct_answer_id
                    }
                    for qq in quiz.questions
                ]
            }
            response.append(quiz_data)

        return jsonify({"status": True, "quizzes": response}), 200

    except Exception as e:
        logging.error(f"Error retrieving quizzes: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving quizzes"}), 500

@app.route("/quiz/<int:quiz_id>", methods=["GET"])
@role_required(["admin","client"])
def get_quiz_for_update(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({"status": False, "message": "Quiz not found"}), 404

        # Collect only question IDs
        question_ids = [qq.question_id for qq in quiz.questions]

        response = {
            "quiz_id": quiz.quiz_id,
            "title": quiz.title,
            "description": quiz.description,
            "questions": question_ids
        }

        return jsonify(response), 200

    except Exception as e:
        logging.error(f"Error retrieving quiz for update: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving quiz"}), 500


@app.route("/user/profile", methods=["GET"])
@jwt_required()
def me(): 
    user_id = get_jwt_identity() 
    # returns 'sub' → user.id 
    claims = get_jwt() # returns full payload 
    return jsonify({ "status": True, "data": { "email": claims["email"], "role": claims["role"] } })

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
 
@app.route("/quiz/random/<int:quiz_size>", methods=["GET"])
@role_required("client")
def generate_random_quiz(quiz_size):
    TARGET_SIZE = quiz_size
    # 1. Fetch all top-level topics
    top_topics = Topic.query.filter_by(parent_topic=None).all()
    if not top_topics:
        return jsonify({"status": False, "message": "No topics found"}), 404

    # 2. Build structure: topic → subtopics → questions
    topic_data = {}

    for topic in top_topics:
        subtopics = topic.subtopics  # children
        topic_data[topic.topic_id] = {
            "topic": topic,
            "subtopics": {},
            "parent_questions": [q.question_id for q in topic.questions],
            "total_available": 0
        }

        # Subtopic questions
        for sub in subtopics:
            sub_qs = [q.question_id for q in sub.questions]
            topic_data[topic.topic_id]["subtopics"][sub.topic_id] = sub_qs

        # Count total available
        total_sub_qs = sum(len(qs) for qs in topic_data[topic.topic_id]["subtopics"].values())
        total_parent_qs = len(topic_data[topic.topic_id]["parent_questions"])
        topic_data[topic.topic_id]["total_available"] = total_sub_qs + total_parent_qs

    # 3. Compute topic quotas
    T = len(top_topics)
    base_quota = TARGET_SIZE // T
    leftover = TARGET_SIZE % T

    topic_quota = {t.topic_id: base_quota for t in top_topics}

    # Distribute leftover to topics with most questions
    sorted_topics = sorted(top_topics, key=lambda t: topic_data[t.topic_id]["total_available"], reverse=True)
    for i in range(leftover):
        topic_quota[sorted_topics[i].topic_id] += 1

    # 4. Select questions per topic
    selected = defaultdict(list)
    global_shortage = 0

    for topic in top_topics:
        tid = topic.topic_id
        quota = topic_quota[tid]
        data = topic_data[tid]

        subtopics = data["subtopics"]
        parent_qs = data["parent_questions"]

        S = len(subtopics) if subtopics else 1
        sub_quota = quota // S
        sub_leftover = quota % S

        # Step A: Fill subtopics
        for sid, qs in subtopics.items():
            take = min(len(qs), sub_quota)
            chosen = random.sample(qs, take)
            selected[tid].extend(chosen)

            if take < sub_quota:
                global_shortage += (sub_quota - take)

        # Step B: Distribute leftover among subtopics
        if subtopics:
            sorted_subs = sorted(subtopics.items(), key=lambda x: len(x[1]), reverse=True)
            for i in range(sub_leftover):
                sid, qs = sorted_subs[i % len(sorted_subs)]
                if qs:
                    chosen = random.choice(qs)
                    if chosen not in selected[tid]:
                        selected[tid].append(chosen)
                else:
                    global_shortage += 1

        # Step C: Fill remaining from parent topic
        remaining = quota - len(selected[tid])
        if remaining > 0:
            take = min(len(parent_qs), remaining)
            chosen = random.sample(parent_qs, take)
            selected[tid].extend(chosen)

            if take < remaining:
                global_shortage += (remaining - take)

    # 5. Redistribute shortages
    if global_shortage > 0:
        # Collect all remaining questions from all topics
        remaining_pool = []
        for tid, data in topic_data.items():
            all_qs = []
            for qs in data["subtopics"].values():
                all_qs.extend(qs)
            all_qs.extend(data["parent_questions"])

            # Remove already selected
            all_qs = [q for q in all_qs if q not in selected[tid]]
            remaining_pool.extend(all_qs)

        # Fill shortages
        take = min(len(remaining_pool), global_shortage)
        extra = random.sample(remaining_pool, take)

        # Add extras to the largest topics
        for qid in extra:
            # Find topic of this question
            q = Question.query.get(qid)
            selected[q.topic.parent_topic or q.topic.topic_id].append(qid)

    # 6. Flatten final list
    final_list = []
    topic_of = {}

    for tid, qs in selected.items():
        for q in qs:
            final_list.append(q)
            topic_of[q] = tid

    # Reduce size if needed
    if len(final_list) > TARGET_SIZE:
        final_list = random.sample(final_list, TARGET_SIZE)

    # 7. Shuffle ensuring no consecutive same-topic questions
    grouped = defaultdict(deque)
    for q in final_list:
        grouped[topic_of[q]].append(q)

    # Max-heap by remaining count
    heap = [(-len(v), tid) for tid, v in grouped.items()]
    import heapq
    heapq.heapify(heap)

    ordered = []
    prev_topic = None

    while heap:
        count1, tid1 = heapq.heappop(heap)
        if tid1 == prev_topic and heap:
            # Use second option
            count2, tid2 = heapq.heappop(heap)
            qid = grouped[tid2].popleft()
            ordered.append(qid)
            prev_topic = tid2
            if len(grouped[tid2]) > 0:
                heapq.heappush(heap, (-(len(grouped[tid2])), tid2))
            heapq.heappush(heap, (count1, tid1))
        else:
            qid = grouped[tid1].popleft()
            ordered.append(qid)
            prev_topic = tid1
            if len(grouped[tid1]) > 0:
                heapq.heappush(heap, (-(len(grouped[tid1])), tid1))

    return jsonify({
        "status": True,
        "questions": ordered
    }), 200

@app.route("/users", methods=["GET"])
@role_required("admin")
def get_all_users():
    try:
        users = User.query.filter(User.role=="client").all()

        response = []
        for u in users:
            user_data = {
                "id": u.id,
                "email": u.email,
                "role": u.role,
            }
            response.append(user_data)

        return jsonify({"status": True, "users": response}), 200

    except Exception as e:
        logging.error(f"Error retrieving users: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving users"}), 500  
        

@app.route("/stats/topics", methods=["GET"])
@role_required(["admin", "client"])
def get_topic_stats():
    try:
        # Get all top-level topics (no parent)
        top_topics = Topic.query.filter_by(parent_topic=None).all()

        labels = []
        data = []
        colors = []

        base_color = "#0097b2"

        def shade_color(hex_color, factor):
            """Generate lighter shades of a base hex color"""
            hex_color = hex_color.lstrip("#")
            r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
            r = min(255, int(r + (255 - r) * factor))
            g = min(255, int(g + (255 - g) * factor))
            b = min(255, int(b + (255 - b) * factor))
            return f"#{r:02x}{g:02x}{b:02x}"

        for idx, topic in enumerate(top_topics):
            labels.append(topic.name)

            # Count questions directly under parent
            parent_count = Question.query.filter_by(topic_id=topic.topic_id).count()

            # Count questions under all subtopics
            sub_count = 0
            for sub in topic.subtopics:
                sub_count += Question.query.filter_by(topic_id=sub.topic_id).count()

            total_count = parent_count + sub_count
            data.append(total_count)

            # Generate a shade for each topic
            colors.append(shade_color(base_color, idx * 0.15))

        return jsonify({
            "labels": labels,
            "data": data,
            "colors": colors
        }), 200

    except Exception as e:
        logging.error(f"Error generating stats: {e}")
        return jsonify({"status": False, "message": "Error generating stats"}), 500
