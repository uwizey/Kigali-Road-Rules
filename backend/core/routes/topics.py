import logging
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from core.models import db, Topic,User
from core.utils.decorators import role_required,rate_limit

topics_bp = Blueprint("topics", __name__)


def build_topic_tree(topic):
    """Recursively build a nested dict for a topic and its subtopics."""
    return {
        "id": topic.topic_id,
        "name": topic.name,
        "subtopics": [build_topic_tree(sub) for sub in topic.subtopics]
    }


# ── Topic CRUD ────────────────────────────────────────────────────────────────

@topics_bp.route("/topic", methods=["POST"])
@role_required(["admin", "client"])
def create_topic():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400
        name = payload.get("topicName")
        if not name:
            return jsonify({"status": False, "message": "Name of the topic required"}), 400
        if Topic.query.filter_by(name=name).first():
            return jsonify({"status": False, "message": "Topic already exists"}), 409
        db.session.add(Topic(name=name, parent_topic=None))
        db.session.commit()
        return jsonify({"status": True, "message": "New topic added successfully"}), 201
    
    except TypeError as e:
        db.session.rollback()
        logging.error(f"Invalid field in Topic: {e}")
        return jsonify({"status": False, "message": "Invalid field provided"}), 400
    
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500
    
    except Exception as e:
        db.session.rollback()
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"status": False, "message": "Server error"}), 500


@topics_bp.route("/topic", methods=["GET"])
@role_required(["admin", "client"])
def get_all_topics():
    try:
        root_topics = Topic.query.filter_by(parent_topic=None).all()
        return jsonify({"status": True, "topics": [build_topic_tree(t) for t in root_topics]}), 200
    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500


@topics_bp.route("/topic/<int:topic_id>", methods=["GET"])
@role_required("admin")
def get_topic(topic_id):
    try:
        topic = Topic.query.get(topic_id)
        if not topic:
            return jsonify({"status": False, "message": "Topic not found"}), 404
        return jsonify({"status": True, "topic": build_topic_tree(topic)}), 200
    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500


@topics_bp.route("/topic", methods=["PUT"])
@role_required(["admin", "client"])
def update_topic():
    try:
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
    
    except TypeError as e:
        db.session.rollback()
        logging.error(f"Invalid field in Topic: {e}")
        return jsonify({"status": False, "message": "Invalid field provided"}), 400
    
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500
    
    except Exception as e:
        db.session.rollback()
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"status": False, "message": "Server error"}), 500


@topics_bp.route("/topic", methods=["DELETE"])
@role_required(["admin", "client"])
def delete_topic():
    try:
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


# ── Subtopic ──────────────────────────────────────────────────────────────────

@topics_bp.route("/subtopic", methods=["POST"])
@role_required("admin")
def create_subtopic():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400
        name = payload.get("subtopicName")
        parent_id = payload.get("parentId")
        if not name:
            return jsonify({"status": False, "message": "Name of the sub topic required"}), 400
        if Topic.query.filter_by(name=name).first():
            return jsonify({"status": False, "message": "The sub topic already exists"}), 409
        db.session.add(Topic(name=name, parent_topic=int(parent_id)))
        db.session.commit()
        return jsonify({"status": True, "message": "New subtopic added successfully"}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"status": False, "message": "Unexpected error occurred"}), 500


# ── Stats ─────────────────────────────────────────────────────────────────────

@topics_bp.route("/stats/topics", methods=["GET"])
@role_required(["admin", "client"])
def get_topic_stats():
    try:
        from core.models import Question
        top_topics = Topic.query.filter_by(parent_topic=None).all()
        labels, data, colors = [], [], []
        base_color = "#0097b2"

        def shade_color(hex_color, factor):
            hex_color = hex_color.lstrip("#")
            r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
            r = min(255, int(r + (255 - r) * factor))
            g = min(255, int(g + (255 - g) * factor))
            b = min(255, int(b + (255 - b) * factor))
            return f"#{r:02x}{g:02x}{b:02x}"

        for idx, topic in enumerate(top_topics):
            labels.append(topic.name)
            parent_count = Question.query.filter_by(topic_id=topic.topic_id).count()
            sub_count = sum(
                Question.query.filter_by(topic_id=sub.topic_id).count()
                for sub in topic.subtopics
            )
            data.append(parent_count + sub_count)
            colors.append(shade_color(base_color, idx * 0.15))

        return jsonify({"labels": labels, "data": data, "colors": colors}), 200
    except Exception as e:
        logging.error(f"Error generating stats: {e}")
        return jsonify({"status": False, "message": "Error generating stats"}), 500