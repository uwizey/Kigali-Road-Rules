import json
import base64
import logging
from flask import Blueprint, request, jsonify
from core.models import db, Question, AnswerOption
from core.utils.decorators import role_required,rate_limit

questions_bp = Blueprint("questions", __name__)

OPTION_LETTERS = ["A", "B", "C", "D"]


def _map_correct_answer(question, correct_answer, options_map):
    if correct_answer in options_map:
        question.correct_answer_id = options_map[correct_answer]
    else:
        try:
            correct_id = int(correct_answer)
            if correct_id in options_map.values():
                question.correct_answer_id = correct_id
        except ValueError:
            pass


@questions_bp.route("/question", methods=["POST"])
@role_required("admin")
@rate_limit(capacity=5, refill_rate=1) 
def create_question():
    try:
        statement = request.form.get("statement")
        topic_id = request.form.get("topicId")
        correct_answer = request.form.get("correctAnswer")
        raw_options = request.form.get("options")

        if not statement:
            return jsonify({"status": False, "message": "Statement is missing"}), 400
        if topic_id is None:
            return jsonify({"status": False, "message": "topicId is missing"}), 400
        if not raw_options:
            return jsonify({"status": False, "message": "Options JSON string is missing"}), 400

        image_data, mimetype = None, None
        if "image" in request.files:
            file = request.files["image"]
            mimetype = file.mimetype
            image_data = file.read()

        new_question = Question(
            content=statement, topic_id=int(topic_id),
            correct_answer_id=None, image_data=image_data, mimetype=mimetype
        )
        db.session.add(new_question)
        db.session.flush()

        try:
            options = json.loads(raw_options) if isinstance(raw_options, str) else raw_options
        except (json.JSONDecodeError, TypeError) as e:
            return jsonify({"status": False, "message": f"Invalid options format: {str(e)}"}), 400

        options_map = {}
        for key, text in options.items():
            if not text:
                continue
            opt = AnswerOption(question_id=new_question.question_id, option_text=text)
            db.session.add(opt)
            db.session.flush()
            options_map[key] = opt.answer_id

        if correct_answer:
            _map_correct_answer(new_question, correct_answer, options_map)

        db.session.commit()
        return jsonify({
            "status": True, "message": "Question created successfully",
            "question_id": new_question.question_id
        }), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating question: {str(e)}")
        return jsonify({"status": False, "message": f"Server error: {str(e)}"}), 500


@questions_bp.route("/questions", methods=["GET"])
@role_required("admin")
@rate_limit(capacity=5, refill_rate=1) 
def get_all_questions():
    try:
        questions = Question.query.all()
        response = [
            {"question_id": q.question_id, "content": q.content,
             "topic_id": q.topic_id, "correct_answer_id": q.correct_answer_id}
            for q in questions
        ]
        return jsonify({"status": True, "questions": response}), 200
    except Exception as e:
        logging.error(f"Error retrieving questions: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving questions"}), 500


@questions_bp.route("/question/<int:question_id>", methods=["GET"])
@role_required(["admin", "client"])
@rate_limit(capacity=20, refill_rate=1) 
def get_question(question_id):
    try:
        question = Question.query.get(question_id)
        if not question:
            return jsonify({"status": False, "message": "Question not found"}), 404

        image_base64 = base64.b64encode(question.image_data).decode("utf-8") if question.image_data else None

        options_map = {}
        correct_letter = None
        for idx, opt in enumerate(question.answer_options):
            if idx < len(OPTION_LETTERS):
                letter = OPTION_LETTERS[idx]
                options_map[letter] = {"id": opt.answer_id, "text": opt.option_text}
                if opt.answer_id == question.correct_answer_id:
                    correct_letter = letter

        return jsonify({"status": True, "question": {
            "statement": question.content,
            "topic": question.topic.name if question.topic else "",
            "topicId": question.topic_id,
            "correctAnswer": correct_letter,
            "image": image_base64,
            "mimetype": question.mimetype,
            "options": options_map
        }}), 200
    except Exception as e:
        logging.error(f"Error retrieving question: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving question"}), 500


@questions_bp.route("/question", methods=["PUT"])
@role_required("admin")
@rate_limit(capacity=5, refill_rate=1) 
def update_question():
    try:
        payload = request.form
        question_id = payload.get("id")
        if not question_id:
            return jsonify({"status": False, "message": "Question ID required"}), 400

        question = Question.query.get(question_id)
        if not question:
            return jsonify({"status": False, "message": "Question not found"}), 404

        if payload.get("statement"):
            question.content = payload.get("statement")
        if payload.get("topicId"):
            question.topic_id = payload.get("topicId")

        if "image" in request.files:
            file = request.files["image"]
            question.mimetype = file.mimetype
            question.image_data = file.read()
        elif payload.get("removeImage") == "true":
            question.image_data = None
            question.mimetype = None

        raw_options = payload.get("options")
        if raw_options:
            try:
                options = json.loads(raw_options) if isinstance(raw_options, str) else raw_options
            except Exception:
                return jsonify({"status": False, "message": "Invalid options format"}), 400
            for key, opt in options.items():
                opt_id = opt.get("id")
                new_text = opt.get("text")
                if opt_id and new_text:
                    existing = AnswerOption.query.get(opt_id)
                    if existing and existing.question_id == question.question_id:
                        existing.option_text = new_text

        correct_answer = payload.get("correctAnswer")
        if correct_answer and raw_options:
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


@questions_bp.route("/question", methods=["DELETE"])
@role_required("admin")
@rate_limit(capacity=5, refill_rate=1) 
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
        for opt in question.answer_options:
            db.session.delete(opt)
        db.session.delete(question)
        db.session.commit()
        return jsonify({"status": True, "message": "Question and its options deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error deleting question: {str(e)}")
        return jsonify({"status": False, "message": "Error deleting question"}), 500