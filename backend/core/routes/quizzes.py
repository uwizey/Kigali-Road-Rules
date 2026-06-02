import logging
import random
import heapq
from collections import defaultdict, deque
from datetime import datetime
from flask import Blueprint, request, g
from core.models import db, Quiz, QuizQuestion, Question, Topic
from core.utils.decorators import (
    role_required,
    subscription_required,
    rate_limit,
    track_event,
    APIResponse,
)
from flask_jwt_extended import get_jwt_identity

quizzes_bp = Blueprint("quizzes", __name__)


# ─── Internal helpers (use @track_event — must return plain dicts) ────────────


@subscription_required("quizzes")
@track_event("quiz_generation_attempt")
def _generate_random_quiz(quiz_size):
    TARGET_SIZE = quiz_size

    top_topics = Topic.query.filter_by(parent_topic=None).all()
    if not top_topics:
        return {
            "status": "error",
            "message": "No topics found",
            "_event_type": "quiz_generation_failed",
            "_event_metadata": {"reason": "no_topics"},
        }, 404

    topic_data = {}
    for topic in top_topics:
        subtopics = topic.subtopics
        sub_qs = {
            sub.topic_id: [q.question_id for q in sub.questions] for sub in subtopics
        }
        parent_qs = [q.question_id for q in topic.questions]
        total = sum(len(v) for v in sub_qs.values()) + len(parent_qs)
        topic_data[topic.topic_id] = {
            "subtopics": sub_qs,
            "parent_questions": parent_qs,
            "total_available": total,
        }

    T = len(top_topics)
    base_quota = TARGET_SIZE // T
    leftover = TARGET_SIZE % T

    topic_quota = {t.topic_id: base_quota for t in top_topics}
    sorted_topics = sorted(
        top_topics,
        key=lambda t: topic_data[t.topic_id]["total_available"],
        reverse=True,
    )
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

        random.shuffle(parent_qs)

        S = len(subtopics) if subtopics else 1
        sub_quota = quota // S
        sub_leftover = quota % S

        for sid, qs in subtopics.items():
            qs_copy = qs[:]
            random.shuffle(qs_copy)
            take = min(len(qs_copy), sub_quota)
            selected[tid].extend(qs_copy[:take])
            if take < sub_quota:
                global_shortage += sub_quota - take

        if subtopics:
            sorted_subs = sorted(
                subtopics.items(), key=lambda x: len(x[1]), reverse=True
            )
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
            selected[tid].extend(parent_qs[:take])
            if take < remaining:
                global_shortage += remaining - take

    if global_shortage > 0:
        remaining_pool = []
        for tid, data in topic_data.items():
            all_qs = [q for qs in data["subtopics"].values() for q in qs] + data[
                "parent_questions"
            ]
            remaining_pool.extend([q for q in all_qs if q not in selected[tid]])

        random.shuffle(remaining_pool)
        for qid in remaining_pool[: min(len(remaining_pool), global_shortage)]:
            q = Question.query.get(qid)
            parent_tid = q.topic.parent_topic or q.topic.topic_id
            selected[parent_tid].append(qid)

    topic_of = {}
    final_list = []
    for tid, qs in selected.items():
        random.shuffle(qs)
        for q in qs:
            final_list.append(q)
            topic_of[q] = tid

    if len(final_list) > TARGET_SIZE:
        final_list = random.sample(final_list, TARGET_SIZE)

    random.shuffle(final_list)

    grouped = defaultdict(deque)
    for q in final_list:
        grouped[topic_of[q]].append(q)

    heap = [(-len(v), random.random(), tid) for tid, v in grouped.items()]
    heapq.heapify(heap)

    ordered = []
    prev_topic = None

    while heap:
        count1, rand1, tid1 = heapq.heappop(heap)

        if tid1 == prev_topic and heap:
            count2, rand2, tid2 = heapq.heappop(heap)

            if random.random() < 0.5:
                tid_first, count_first, rand_first = tid2, count2, rand2
                tid_second, count_second, rand_second = tid1, count1, rand1
            else:
                tid_first, count_first, rand_first = tid1, count1, rand1
                tid_second, count_second, rand_second = tid2, count2, rand2

            qid = grouped[tid_first].popleft()
            ordered.append(qid)
            prev_topic = tid_first

            if grouped[tid_first]:
                heapq.heappush(
                    heap, (-len(grouped[tid_first]), random.random(), tid_first)
                )
            heapq.heappush(heap, (count_second, rand_second, tid_second))
        else:
            qid = grouped[tid1].popleft()
            ordered.append(qid)
            prev_topic = tid1
            if grouped[tid1]:
                heapq.heappush(heap, (-len(grouped[tid1]), random.random(), tid1))

    sub = g.subscription
    if sub.remaining_quizzes > 0:
        sub.remaining_quizzes -= 1
        db.session.commit()
    else:
        return {
            "status": "error",
            "message": "No remaining quizzes in subscription",
            "_event_type": "quiz_generation_failed",
            "_event_metadata": {"reason": "quota_exceeded"},
        }, 403

    return {
        "status": "success",
        "message": "Quiz generated successfully",
        "data": {"questions": ordered},
        "_event_type": "quiz_generation_success",
        "_event_metadata": {"quiz_size": TARGET_SIZE, "selected_count": len(ordered)},
    }, 200


@subscription_required("topic_quizzes")
@track_event("topic_quiz_attempt")
def _handle_topic_quiz(topic_name, target_size):
    try:
        topic = Topic.query.filter_by(name=topic_name).first()
        if not topic:
            return {
                "status": "error",
                "message": "Topic not found",
                "_event_type": "topic_quiz_failed",
                "_event_metadata": {"topic": topic_name, "reason": "not_found"},
            }, 404

        def collect_recursive(t):
            qs = [q.question_id for q in t.questions]
            for sub in t.subtopics:
                qs.extend(collect_recursive(sub))
            return qs

        all_qs = collect_recursive(topic)
        if not all_qs:
            return {
                "status": "error",
                "message": "No questions found for this topic",
                "_event_type": "topic_quiz_failed",
                "_event_metadata": {"topic": topic_name, "reason": "no_questions"},
            }, 404

        questions = random.sample(all_qs, min(len(all_qs), target_size))
        sub = g.subscription
        sub.remaining_topic_quizzes -= 1
        db.session.commit()

        return {
            "status": "success",
            "message": "Topic quiz generated successfully",
            "data": {
                "questions": questions,
                "count": len(questions),
                "topic": topic_name,
            },
            "_event_type": "topic_quiz_success",
            "_event_metadata": {
                "topic": topic_name,
                "target_size": target_size,
                "selected_count": len(questions),
            },
        }, 200

    except Exception as e:
        logging.error(f"Error handling topic quiz: {str(e)}")
        return {
            "status": "error",
            "message": "Error handling topic quiz",
            "_event_type": "topic_quiz_error",
            "_event_metadata": {"topic": topic_name, "error": str(e)},
        }, 500


# ─── Routes (use APIResponse) ─────────────────────────────────────────────────


@quizzes_bp.route("/quiz", methods=["POST"])
@role_required("admin")
@rate_limit(capacity=5, refill_rate=1)
def create_quiz():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        title = payload.get("title")
        description = payload.get("description")
        question_ids = payload.get("questions")

        if not title or not description or not question_ids:
            return APIResponse.bad_request(
                "Title, description, and questions are required"
            )

        new_quiz = Quiz(
            title=title, description=description, publish_date=datetime.utcnow()
        )
        db.session.add(new_quiz)
        db.session.flush()

        for q_id in question_ids:
            if not Question.query.get(q_id):
                return APIResponse.not_found(f"Question {q_id} not found")
            db.session.add(QuizQuestion(quiz_id=new_quiz.quiz_id, question_id=q_id))

        db.session.commit()
        return APIResponse.created(
            data={"quiz_id": new_quiz.quiz_id},
            message="Quiz created successfully",
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating quiz: {str(e)}")
        return APIResponse.server_error("Error creating quiz")


@quizzes_bp.route("/quizzes", methods=["GET"])
@role_required(["admin", "client"])
@rate_limit(capacity=5, refill_rate=1)
def get_all_quizzes():
    try:
        quizzes = Quiz.query.all()
        data = [
            {
                "quiz_id": quiz.quiz_id,
                "title": quiz.title,
                "description": quiz.description,
                "question_count": len(quiz.questions),
                "publish_date": (
                    quiz.publish_date.isoformat() if quiz.publish_date else None
                ),
            }
            for quiz in quizzes
        ]
        return APIResponse.success(data=data, meta={"count": len(data)})

    except Exception as e:
        logging.error(f"Error retrieving quizzes: {str(e)}")
        return APIResponse.server_error("Error retrieving quizzes")


@quizzes_bp.route("/quiz/<int:quiz_id>", methods=["GET"])
@role_required(["admin", "client"])
@subscription_required("template_exams")
@rate_limit(capacity=5, refill_rate=1)
@track_event("template_exams")
def get_quiz(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        sub = g.subscription
        sub.remaining_template_exams -= 1
        db.session.commit()

        if not quiz:
            return {
                "status": "error",
                "message": "Quiz not found",
                "_event_type": "quiz_failed",
                "_event_metadata": {"quiz_id": quiz_id},
            }, 404

        return {
            "status": "success",
            "message": "Quiz retrieved successfully",
            "data": {
                "quiz_id": quiz.quiz_id,
                "title": quiz.title,
                "description": quiz.description,
                "questions": [qq.question_id for qq in quiz.questions],
            },
            "_event_type": "quiz_provided",
            "_event_metadata": {"quiz_id": quiz.quiz_id, "title": quiz.title},
        }, 200

    except Exception as e:
        logging.error(f"Error retrieving quiz: {str(e)}")
        return {
            "status": "error",
            "message": "Error retrieving quiz",
            "_event_type": "quiz_error",
            "_event_metadata": {"quiz_id": quiz_id, "error": str(e)},
        }, 500


@quizzes_bp.route("/quiz-admin/<int:quiz_id>", methods=["GET"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1)
def get_quiz_admin(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return APIResponse.not_found("Quiz not found")

        return APIResponse.success(
            data={
                "quiz_id": quiz.quiz_id,
                "title": quiz.title,
                "description": quiz.description,
                "questions": [qq.question_id for qq in quiz.questions],
            }
        )

    except Exception as e:
        logging.error(f"Error retrieving quiz: {str(e)}")
        return APIResponse.server_error("Error retrieving quiz")


@quizzes_bp.route("/quiz", methods=["PUT"])
@role_required("admin")
@rate_limit(capacity=5, refill_rate=1)
def update_quiz():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        quiz_id = payload.get("quiz_id")
        title = payload.get("title")
        description = payload.get("description")
        question_ids = payload.get("questions")

        if not all([quiz_id, title, description, question_ids]):
            return APIResponse.bad_request(
                "quiz_id, title, description, and questions are required"
            )

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return APIResponse.not_found("Quiz not found")

        quiz.title = title
        quiz.description = description
        QuizQuestion.query.filter_by(quiz_id=quiz_id).delete()

        for q_id in question_ids:
            if not Question.query.get(q_id):
                return APIResponse.not_found(f"Question {q_id} not found")
            db.session.add(QuizQuestion(quiz_id=quiz_id, question_id=q_id))

        db.session.commit()
        return APIResponse.success(
            data={"quiz_id": quiz.quiz_id},
            message="Quiz updated successfully",
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating quiz: {str(e)}")
        return APIResponse.server_error("Error updating quiz")


@quizzes_bp.route("/quiz", methods=["DELETE"])
@role_required("admin")
@rate_limit(capacity=5, refill_rate=1)
def delete_quiz():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        quiz_id = payload.get("id")
        if not quiz_id:
            return APIResponse.bad_request("Quiz ID required")

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return APIResponse.not_found("Quiz not found")

        QuizQuestion.query.filter_by(quiz_id=quiz_id).delete()
        db.session.delete(quiz)
        db.session.commit()
        return APIResponse.success(
            data={"quiz_id": quiz_id},
            message="Quiz deleted successfully",
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error deleting quiz: {str(e)}")
        return APIResponse.server_error("Error deleting quiz")


@quizzes_bp.route("/exercise", methods=["GET"])
@role_required("client")
@rate_limit(capacity=5, refill_rate=1)
def handle_exercise_quiz():
    target_size = 5
    topic_name = request.args.get("topic")

    if not topic_name:
        return APIResponse.bad_request("Topic name required for exercises")

    topic = Topic.query.filter_by(name=topic_name).first()
    if not topic:
        return APIResponse.not_found("Topic not found")

    def collect_recursive(t):
        qs = [q.question_id for q in t.questions]
        for sub in t.subtopics:
            qs.extend(collect_recursive(sub))
        return qs

    all_qs = collect_recursive(topic)
    if not all_qs:
        return APIResponse.not_found("No questions found for this topic")

    questions = random.sample(all_qs, min(len(all_qs), target_size))
    return APIResponse.success(
        data={
            "questions": questions,
            "count": len(questions),
            "topic": topic_name,
            "exercise": True,
        }
    )


@quizzes_bp.route("/quiz/random", methods=["GET"])
@role_required("client")
@rate_limit(capacity=5, refill_rate=1)
def random_quiz():
    try:
        topic_name = request.args.get("topic")
        user_id = int(get_jwt_identity())
        logging.info(
            f"User {user_id} requested a random quiz with topic='{topic_name}'"
        )

        if topic_name:
            return _handle_topic_quiz(topic_name, target_size=10)
        else:
            return _generate_random_quiz(20)

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error generating quiz: {e}")
        return APIResponse.server_error("Server error generating quiz")
