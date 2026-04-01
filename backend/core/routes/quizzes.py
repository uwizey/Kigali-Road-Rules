import logging
import random
import heapq
from collections import defaultdict, deque
from datetime import datetime
from flask import Blueprint, request, jsonify,g
from core.models import db, Quiz, QuizQuestion, Question, Topic, Subscription
from core.utils.decorators import role_required,subscription_required,rate_limit
from flask_jwt_extended import get_jwt_identity

quizzes_bp = Blueprint("quizzes", __name__)

@subscription_required("quizzes")
def _generate_random_quiz(quiz_size):
    
    TARGET_SIZE = quiz_size
    top_topics = Topic.query.filter_by(parent_topic=None).all()
    if not top_topics:
        return jsonify({"status": False, "message": "No topics found"}), 404

    topic_data = {}
    for topic in top_topics:
        subtopics = topic.subtopics
        sub_qs = {sub.topic_id: [q.question_id for q in sub.questions] for sub in subtopics}
        parent_qs = [q.question_id for q in topic.questions]
        total = sum(len(v) for v in sub_qs.values()) + len(parent_qs)
        topic_data[topic.topic_id] = {
            "subtopics": sub_qs, "parent_questions": parent_qs, "total_available": total
        }

    T = len(top_topics)
    base_quota = TARGET_SIZE // T
    leftover = TARGET_SIZE % T
    topic_quota = {t.topic_id: base_quota for t in top_topics}
    sorted_topics = sorted(top_topics, key=lambda t: topic_data[t.topic_id]["total_available"], reverse=True)
    for i in range(leftover):
        topic_quota[sorted_topics[i].topic_id] += 1

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

        for sid, qs in subtopics.items():
            take = min(len(qs), sub_quota)
            selected[tid].extend(random.sample(qs, take))
            if take < sub_quota:
                global_shortage += (sub_quota - take)

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

        remaining = quota - len(selected[tid])
        if remaining > 0:
            take = min(len(parent_qs), remaining)
            selected[tid].extend(random.sample(parent_qs, take))
            if take < remaining:
                global_shortage += (remaining - take)

    if global_shortage > 0:
        remaining_pool = []
        for tid, data in topic_data.items():
            all_qs = [q for qs in data["subtopics"].values() for q in qs] + data["parent_questions"]
            remaining_pool.extend([q for q in all_qs if q not in selected[tid]])
        extra = random.sample(remaining_pool, min(len(remaining_pool), global_shortage))
        for qid in extra:
            q = Question.query.get(qid)
            selected[q.topic.parent_topic or q.topic.topic_id].append(qid)

    topic_of = {}
    final_list = []
    for tid, qs in selected.items():
        for q in qs:
            final_list.append(q)
            topic_of[q] = tid

    if len(final_list) > TARGET_SIZE:
        final_list = random.sample(final_list, TARGET_SIZE)

    grouped = defaultdict(deque)
    for q in final_list:
        grouped[topic_of[q]].append(q)

    heap = [(-len(v), tid) for tid, v in grouped.items()]
    heapq.heapify(heap)
    ordered = []
    prev_topic = None

    while heap:
        count1, tid1 = heapq.heappop(heap)
        if tid1 == prev_topic and heap:
            count2, tid2 = heapq.heappop(heap)
            qid = grouped[tid2].popleft()
            ordered.append(qid)
            prev_topic = tid2
            if grouped[tid2]:
                heapq.heappush(heap, (-len(grouped[tid2]), tid2))
            heapq.heappush(heap, (count1, tid1))
        else:
            qid = grouped[tid1].popleft()
            ordered.append(qid)
            prev_topic = tid1
            if grouped[tid1]:
                heapq.heappush(heap, (-len(grouped[tid1]), tid1))
    
    
    
    return jsonify({"status": True, "questions": ordered}), 200

@quizzes_bp.route("/quiz", methods=["POST"])
@role_required("admin")
@rate_limit(capacity=5, refill_rate=1) 
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
        new_quiz = Quiz(title=title, description=description, publish_date=datetime.utcnow())
        db.session.add(new_quiz)
        db.session.flush()
        for q_id in question_ids:
            if not Question.query.get(q_id):
                return jsonify({"status": False, "message": f"Question {q_id} not found"}), 404
            db.session.add(QuizQuestion(quiz_id=new_quiz.quiz_id, question_id=q_id))

        sub = g.subscription
        sub.remaining_quizzes -= 1
        db.session.commit()
        
        return jsonify({"status": True, "message": "Quiz created successfully", "quiz_id": new_quiz.quiz_id}), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating quiz: {str(e)}")
        return jsonify({"status": False, "message": "Error creating quiz"}), 500

@quizzes_bp.route("/quizzes", methods=["GET"])
@role_required(["admin", "client"])
@rate_limit(capacity=5, refill_rate=1) 
def get_all_quizzes():
    try:
        quizzes = Quiz.query.all()
        response = [
            {
                "quiz_id": quiz.quiz_id, "title": quiz.title,
                "description": quiz.description,
                "question_count": len(quiz.questions),
                "publish_date": quiz.publish_date.isoformat() if quiz.publish_date else None,
            }
            for quiz in quizzes
        ]
        return jsonify({"status": True, "quizzes": response}), 200
    except Exception as e:
        logging.error(f"Error retrieving quizzes: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving quizzes"}), 500

@quizzes_bp.route("/quiz/<int:quiz_id>", methods=["GET"])
@role_required(["admin", "client"])
@subscription_required("template_exams")
@rate_limit(capacity=5, refill_rate=1) 
def get_quiz(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        sub = g.subscription
        print(f"Before decrement: {sub.remaining_template_exams}")

        sub.remaining_template_exams -= 1
        db.session.commit()

        print(f"After decrement: {sub.remaining_template_exams}")
        
        if not quiz:
            return jsonify({"status": False, "message": "Quiz not found"}), 404
        return jsonify({
            "quiz_id": quiz.quiz_id, "title": quiz.title,
            "description": quiz.description,
            "questions": [qq.question_id for qq in quiz.questions]
        }), 200
    except Exception as e:
        logging.error(f"Error retrieving quiz: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving quiz"}), 500


@quizzes_bp.route("/quiz-admin/<int:quiz_id>", methods=["GET"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1) 
def get_quiz_admin(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({"status": False, "message": "Quiz not found"}), 404
        return jsonify({
            "quiz_id": quiz.quiz_id, "title": quiz.title,
            "description": quiz.description,
            "questions": [qq.question_id for qq in quiz.questions]
        }), 200
    except Exception as e:
        logging.error(f"Error retrieving quiz: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving quiz"}), 500


@quizzes_bp.route("/quiz", methods=["PUT"])
@role_required("admin")
@rate_limit(capacity=5, refill_rate=1) 
def update_quiz():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400
        quiz_id = payload.get("quiz_id")
        title = payload.get("title")
        description = payload.get("description")
        question_ids = payload.get("questions")
        if not all([quiz_id, title, description, question_ids]):
            return jsonify({"status": False, "message": "quiz_id, title, description, and questions are required"}), 400
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({"status": False, "message": "Quiz not found"}), 404
        quiz.title = title
        quiz.description = description
        QuizQuestion.query.filter_by(quiz_id=quiz_id).delete()
        for q_id in question_ids:
            if not Question.query.get(q_id):
                return jsonify({"status": False, "message": f"Question {q_id} not found"}), 404
            db.session.add(QuizQuestion(quiz_id=quiz_id, question_id=q_id))
        db.session.commit()
        return jsonify({"status": True, "message": "Quiz updated successfully", "quiz_id": quiz.quiz_id}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating quiz: {str(e)}")
        return jsonify({"status": False, "message": "Error updating quiz"}), 500

@quizzes_bp.route("/quiz", methods=["DELETE"])
@role_required("admin")
@rate_limit(capacity=5, refill_rate=1) 
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
        QuizQuestion.query.filter_by(quiz_id=quiz_id).delete()
        db.session.delete(quiz)
        db.session.commit()
        return jsonify({"status": True, "message": "Quiz deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error deleting quiz: {str(e)}")
        return jsonify({"status": False, "message": "Error deleting quiz"}), 500

@quizzes_bp.route("/exercise", methods=["GET"])
@role_required("client")
@rate_limit(capacity=5, refill_rate=1) 
def _handle_exercise_quiz():
    target_size=5
    topic_name = request.args.get("topic")
    is_exercise = request.args.get("exercise", "false").lower() == "true"
    if not topic_name:
        return jsonify({"status": False, "message": "Topic name required for exercises"}), 400

    topic = Topic.query.filter_by(name=topic_name).first()
    if not topic:
        return jsonify({"status": False, "message": "Topic not found"}), 404

    def collect_recursive(t):
        qs = [q.question_id for q in t.questions]
        for sub in t.subtopics:
            qs.extend(collect_recursive(sub))
        return qs

    all_qs = collect_recursive(topic)
    if not all_qs:
        return jsonify({"status": False, "message": "No questions found"}), 404

    questions = random.sample(all_qs, min(len(all_qs), target_size))
    return jsonify({
        "status": True,
        "questions": questions,
        "count": len(questions),
        "topic": topic_name,
        "exercise": True
    }), 200


@subscription_required("topic_quizzes")
def _handle_topic_quiz(topic_name, target_size):
    
    topic = Topic.query.filter_by(name=topic_name).first()
    if not topic:
        return jsonify({"status": False, "message": "Topic not found"}), 404

    def collect_recursive(t):
        qs = [q.question_id for q in t.questions]
        for sub in t.subtopics:
            qs.extend(collect_recursive(sub))
        return qs

    all_qs = collect_recursive(topic)
    if not all_qs:
        return jsonify({"status": False, "message": "No questions found"}), 404

    questions = random.sample(all_qs, min(len(all_qs), target_size))
    sub = g.subscription
    sub.remaining_topic_quizzes -= 1
    db.session.commit()
    return jsonify({
        "status": True,
        "questions": questions,
        "count": len(questions),
        "topic": topic_name
    }), 200

@quizzes_bp.route("/quiz/random", methods=["GET"])
@role_required("client")
@rate_limit(capacity=5, refill_rate=1) 
def random_quiz():
    try:
        topic_name = request.args.get("topic")
        is_exercise = request.args.get("exercise", "false").lower() == "true"
        user_id = int(get_jwt_identity())
        print(f"User {user_id} requested a random quiz with topic='{topic_name}' and exercise={is_exercise}")
        if topic_name:
            return _handle_topic_quiz(topic_name, target_size=10)
        else:
            return _generate_random_quiz(20)

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error generating quiz: {e}")
        return jsonify({"status": False, "message": "Server error"}), 500


