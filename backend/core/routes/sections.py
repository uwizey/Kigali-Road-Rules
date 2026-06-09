import logging
from flask import Blueprint, request
from core.models import db, Section, ComponentItem
from core.utils.decorators import role_required, rate_limit, track_event, APIResponse

sections_bp = Blueprint("sections", __name__)


# ─── @track_event route (must return plain dict) ──────────────────────────────

@sections_bp.route("/sections/<int:topic_id>", methods=["GET"])
@role_required(["admin", "client"])
@rate_limit(capacity=5, refill_rate=0.5)
@track_event("sections_reading")
def get_sections_by_topic(topic_id):
    try:
        sections = (
            Section.query
            .filter_by(topic_id=topic_id)
            .order_by(Section.order_index)
            .all()
        )
        if not sections:
            return {
                "status": "error",
                "message": f"No sections found for topic_id {topic_id}",
                "_event_type": "sections_failed",
                "_event_metadata": {"topic_id": topic_id, "reason": "no_sections"},
            }, 404

        result = [
            {
                "section_id": s.section_id,
                "title": s.title,
                "order_index": s.order_index,
                "is_locked": s.is_locked,
                "created_at": s.created_at.isoformat(),
            }
            for s in sections
        ]

        return {
            "status": "success",
            "message": "Sections retrieved successfully",
            "data": {"topic_id": topic_id, "sections": result},
            "_event_type": "sections_success",
            "_event_metadata": {"topic_id": topic_id, "count": len(result)},
        }, 200

    except Exception as e:
        logging.error(f"Error retrieving sections for topic_id {topic_id}: {e}")
        return {
            "status": "error",
            "message": "Server error while retrieving sections",
            "_event_type": "sections_error",
            "_event_metadata": {"topic_id": topic_id, "error": str(e)},
        }, 500


# ─── Standard routes (use APIResponse) ───────────────────────────────────────

@sections_bp.route("/section", methods=["POST"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=0.5)
def create_section():
    try:
        data = request.get_json()
        if not data:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        new_section = Section(
            topic_id=data["topic_id"],
            title=data["title"],
            order_index=data.get("order_index", 0),
            is_locked=data.get("is_locked", False),
        )
        db.session.add(new_section)
        db.session.commit()

        return APIResponse.created(
            data={
                "section_id": new_section.section_id,
                "title": new_section.title,
                "order_index": new_section.order_index,
                "topic_id": new_section.topic_id,
                "created_at": new_section.created_at.isoformat() if new_section.created_at else None,
                "components": [],
            },
            message="Section created successfully",
        )

    except Exception as e:
        logging.error(f"Error creating section: {e}")
        return APIResponse.server_error()


@sections_bp.route("/sections/<int:section_id>", methods=["PUT"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=0.5)
def update_section(section_id):
    try:
        data = request.get_json()
        if not data:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        section = Section.query.get(section_id)
        if not section:
            return APIResponse.not_found("Section not found")

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
                            title=item_data.get("title", f"Item {idx + 1}"),
                            content=item_data.get("content"),
                            format_type=item_data.get("format_type", "content"),
                            order_index=item_data.get("order_index", idx),
                        ))

        db.session.commit()
        return APIResponse.success(
            data={"section_id": section.section_id},
            message="Section updated successfully",
        )

    except Exception as e:
        logging.error(f"Error updating section {section_id}: {e}")
        db.session.rollback()
        return APIResponse.server_error()


@sections_bp.route("/sections/<int:section_id>", methods=["DELETE"])
@role_required(["admin"])
def delete_section(section_id):
    try:
        section = Section.query.get(section_id)
        if not section:
            return APIResponse.not_found("Section not found")

        db.session.delete(section)
        db.session.commit()
        return APIResponse.success(
            data={"section_id": section_id},
            message="Section deleted successfully",
        )

    except Exception as e:
        logging.error(f"Error deleting section {section_id}: {e}")
        return APIResponse.server_error()