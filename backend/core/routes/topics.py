import logging
from flask import Blueprint, request
from sqlalchemy.exc import SQLAlchemyError
from core.models import db, Topic
from core.utils.decorators import role_required, rate_limit, APIResponse

topics_bp = Blueprint("topics", __name__)


def build_topic_tree(topic):
    """Recursively build a nested dict for a topic and its subtopics."""
    return {
        "id": topic.topic_id,
        "name": topic.name,
        "subtopics": [build_topic_tree(sub) for sub in topic.subtopics],
    }


# ── Topic CRUD ────────────────────────────────────────────────────────────────


@topics_bp.route("/topic", methods=["POST"])
@role_required(["admin", "client"])
def create_topic():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        name = payload.get("topicName")
        if not name:
            return APIResponse.bad_request("Name of the topic required")

        if Topic.query.filter_by(name=name).first():
            return APIResponse.conflict("Topic already exists")

        db.session.add(Topic(name=name, parent_topic=None))
        db.session.commit()
        return APIResponse.created(message="New topic added successfully")

    except TypeError as e:
        db.session.rollback()
        logging.error(f"Invalid field in Topic: {e}")
        return APIResponse.bad_request("Invalid field provided")

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return APIResponse.server_error("Database error occurred")

    except Exception as e:
        db.session.rollback()
        logging.error(f"Unexpected error: {str(e)}")
        return APIResponse.server_error()


@topics_bp.route("/topic", methods=["GET"])
@role_required(["admin", "client"])
def get_all_topics():
    try:
        root_topics = Topic.query.filter_by(parent_topic=None).all()
        data = [build_topic_tree(t) for t in root_topics]
        return APIResponse.success(data=data, meta={"count": len(data)})

    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return APIResponse.server_error("Database error occurred")


@topics_bp.route("/topic/<int:topic_id>", methods=["GET"])
@role_required("admin")
def get_topic(topic_id):
    try:
        topic = Topic.query.get(topic_id)
        if not topic:
            return APIResponse.not_found("Topic not found")

        return APIResponse.success(data=build_topic_tree(topic))

    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return APIResponse.server_error("Database error occurred")


@topics_bp.route("/topic", methods=["PUT"])
@role_required(["admin", "client"])
def update_topic():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        topic_id = payload.get("id")
        new_name = payload.get("topicName")
        if not topic_id or not new_name:
            return APIResponse.bad_request("Topic ID and new name required")

        topic = Topic.query.get(topic_id)
        if not topic:
            return APIResponse.not_found("Topic not found")

        topic.name = new_name
        db.session.commit()
        return APIResponse.success(
            data={"id": topic.topic_id, "name": topic.name},
            message="Topic updated successfully",
        )

    except TypeError as e:
        db.session.rollback()
        logging.error(f"Invalid field in Topic: {e}")
        return APIResponse.bad_request("Invalid field provided")

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return APIResponse.server_error("Database error occurred")

    except Exception as e:
        db.session.rollback()
        logging.error(f"Unexpected error: {str(e)}")
        return APIResponse.server_error()


@topics_bp.route("/topic", methods=["DELETE"])
@role_required(["admin", "client"])
def delete_topic():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        topic_id = payload.get("id")
        if not topic_id:
            return APIResponse.bad_request("Topic ID required")

        topic = Topic.query.get(topic_id)
        if not topic:
            return APIResponse.not_found("Topic not found")

        db.session.delete(topic)
        db.session.commit()
        return APIResponse.success(
            data={"id": topic_id},
            message="Topic deleted successfully",
        )

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return APIResponse.server_error("Database error occurred")


# ── Subtopic ──────────────────────────────────────────────────────────────────


@topics_bp.route("/subtopic", methods=["POST"])
@role_required("admin")
def create_subtopic():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        name = payload.get("subtopicName")
        parent_id = payload.get("parentId")

        if not name:
            return APIResponse.bad_request("Name of the subtopic required")
        if not parent_id:
            return APIResponse.bad_request("parentId is required")

        if Topic.query.filter_by(name=name).first():
            return APIResponse.conflict("The subtopic already exists")

        db.session.add(Topic(name=name, parent_topic=int(parent_id)))
        db.session.commit()
        return APIResponse.created(message="New subtopic added successfully")

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return APIResponse.server_error("Database error occurred")

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return APIResponse.server_error()


# ── Stats ─────────────────────────────────────────────────────────────────────


@topics_bp.route("/stats/topics", methods=["GET"])
@role_required(["admin", "client"])
def get_topic_stats():
    try:
        from core.models import Question

        def shade_color(hex_color, factor):
            hex_color = hex_color.lstrip("#")
            r, g, b = tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))
            r = min(255, int(r + (255 - r) * factor))
            g = min(255, int(g + (255 - g) * factor))
            b = min(255, int(b + (255 - b) * factor))
            return f"#{r:02x}{g:02x}{b:02x}"

        base_color = "#0097b2"
        top_topics = Topic.query.filter_by(parent_topic=None).all()

        labels, data, colors = [], [], []
        for idx, topic in enumerate(top_topics):
            parent_count = Question.query.filter_by(topic_id=topic.topic_id).count()
            sub_count = sum(
                Question.query.filter_by(topic_id=sub.topic_id).count()
                for sub in topic.subtopics
            )
            labels.append(topic.name)
            data.append(parent_count + sub_count)
            colors.append(shade_color(base_color, idx * 0.15))

        return APIResponse.success(
            data={"labels": labels, "data": data, "colors": colors}
        )

    except Exception as e:
        logging.error(f"Error generating stats: {e}")
        return APIResponse.server_error("Error generating stats")
