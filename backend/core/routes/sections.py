import logging
from flask import Blueprint, request, jsonify
from core.models import db, Section, ComponentItem
from core.utils.decorators import role_required,rate_limit,track_event

sections_bp = Blueprint("sections", __name__)


@sections_bp.route("/sections/<int:topic_id>", methods=["GET"])
@role_required(["admin", "client"])
@rate_limit(capacity=5, refill_rate=1)
@track_event("sections_reading")   # 👈 added decorator
def get_sections_by_topic(topic_id):
    try:
        sections = Section.query.filter_by(topic_id=topic_id).order_by(Section.order_index).all()
        if not sections:
            return {
                "status": False,
                "message": f"No sections found for topic_id {topic_id}",
                "_event_type": "sections_failed",
                "_event_metadata": {"topic_id": topic_id, "reason": "no_sections"}
            }, 200

        result = [
            {
                "section_id": s.section_id,
                "title": s.title,
                "order_index": s.order_index,
                "is_locked": s.is_locked,
                "created_at": s.created_at.isoformat()
            }
            for s in sections
        ]

        return {
            "status": True,
            "topic_id": topic_id,
            "sections": result,
            "count": len(result),
            "_event_type": "sections_success",
            "_event_metadata": {"topic_id": topic_id, "count": len(result)}
        }, 200

    except Exception as e:
        logging.error(f"Error retrieving sections for topic_id {topic_id}: {e}")
        return {
            "status": False,
            "message": "Server error while retrieving sections",
            "_event_type": "sections_error",
            "_event_metadata": {"topic_id": topic_id, "error": str(e)}
        }, 500


@sections_bp.route("/section", methods=["POST"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1) 
def create_section():
    try:
        data = request.get_json()
        new_section = Section(
            topic_id=data["topic_id"], title=data["title"],
            order_index=data.get("order_index", 0), is_locked=data.get("is_locked", False)
        )
        db.session.add(new_section)
        db.session.commit()
        return jsonify({
            "status": True, "message": "Section created successfully",
            "section": {
                "section_id": new_section.section_id, "title": new_section.title,
                "order_index": new_section.order_index, "topic_id": new_section.topic_id,
                "created_at": new_section.created_at.isoformat() if new_section.created_at else None,
                "components": []
            }
        }), 201
    except Exception as e:
        logging.error(f"Error creating section: {e}")
        return jsonify({"status": False, "message": "Server error"}), 500


@sections_bp.route("/sections/<int:section_id>", methods=["PUT"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1) 
def update_section(section_id):
    try:
        data = request.get_json()
        section = Section.query.get(section_id)
        if not section:
            return jsonify({"status": False, "message": "Section not found"}), 404
        section.title = data.get("title", section.title)
        section.order_index = data.get("order_index", section.order_index)
        section.is_locked = data.get("is_locked", section.is_locked)
        comps_payload = data.get("components", [])
        for comp in section.components:
            for item in comp.items:
                db.session.delete(item)
            for comp_payload in comps_payload:
                if comp_payload.get("component_id") == comp.component_id:
                    for idx, item_data in enumerate(comp_payload.get("items", [])):
                        db.session.add(ComponentItem(
                            component_id=comp.component_id,
                            title=item_data.get("title", f"Item {idx+1}"),
                            content=item_data.get("content", None),
                            format_type=item_data.get("format_type", "content"),
                            order_index=item_data.get("order_index", idx)
                        ))
        db.session.commit()
        return jsonify({"status": True, "message": "Section updated successfully", "section_id": section.section_id}), 200
    except Exception as e:
        logging.error(f"Error updating section {section_id}: {e}")
        db.session.rollback()
        return jsonify({"status": False, "message": "Server error"}), 500


@sections_bp.route("/sections/<int:section_id>", methods=["DELETE"])
@role_required(["admin"])
def delete_section(section_id):
    try:
        section = Section.query.get(section_id)
        if not section:
            return jsonify({"status": False, "message": "Section not found"}), 404
        db.session.delete(section)
        db.session.commit()
        return jsonify({"status": True, "message": "Section deleted successfully", "section_id": section_id}), 200
    except Exception as e:
        logging.error(f"Error deleting section {section_id}: {e}")
        return jsonify({"status": False, "message": "Server error"}), 500