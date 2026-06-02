import json
import base64
import logging
from flask import Blueprint, request
from core.models import db, Component, ComponentItem
from core.utils.decorators import role_required, rate_limit, APIResponse

components_bp = Blueprint("components", __name__)


def _serialize_item(item):
    image_b64 = (
        base64.b64encode(item.image_data).decode("utf-8") if item.image_data else None
    )
    return {
        "item_id": item.item_id,
        "title": item.title,
        "format_type": item.format_type,
        "content": item.content,
        "order_index": item.order_index,
        "created_at": item.created_at.isoformat(),
        "mimetype": item.mimetype,
        "image_data": image_b64,
    }


def _serialize_component(comp):
    return {
        "component_id": comp.component_id,
        "section_id": comp.section_id,
        "title": comp.title,
        "component_type": comp.component_type,
        "order_index": comp.order_index,
        "created_at": comp.created_at.isoformat(),
        "items": [_serialize_item(item) for item in comp.items],
    }


@components_bp.route("/sections/<int:section_id>/components", methods=["GET"])
@role_required(["admin", "client"])
@rate_limit(capacity=20, refill_rate=1)
def get_components_by_section(section_id):
    try:
        components = (
            Component.query.filter_by(section_id=section_id)
            .order_by(Component.order_index)
            .all()
        )
        if not components:
            return APIResponse.not_found(
                f"No components found for section_id {section_id}"
            )

        data = [_serialize_component(comp) for comp in components]
        return APIResponse.success(
            data=data, meta={"section_id": section_id, "count": len(data)}
        )

    except Exception as e:
        logging.error(f"Error retrieving components for section_id {section_id}: {e}")
        return APIResponse.server_error("Server error while retrieving components")


@components_bp.route("/component", methods=["POST"])
@role_required(["admin"])
@rate_limit(capacity=20, refill_rate=1)
def create_component():
    try:
        data = request.get_json()
        if not data:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        new_component = Component(
            section_id=data["section_id"],
            title=data.get("title", "Untitled Component"),
            component_type=data.get("format_type", "content"),
            order_index=data.get("order_index", 0),
        )
        db.session.add(new_component)
        db.session.flush()

        for idx, item in enumerate(data.get("items", [])):
            if not item:
                continue
            if not (
                item.get("title") or item.get("content") or item.get("format_type")
            ):
                continue

            db.session.add(
                ComponentItem(
                    component_id=new_component.component_id,
                    format_type=item.get("format_type", "content"),
                    title=item.get("title", f"Item {idx + 1}"),
                    content=item.get("content"),
                    order_index=item.get("order_index", idx),
                    mimetype=item.get("mimetype"),
                    image_data=item.get("image_data"),
                )
            )

        db.session.commit()
        return APIResponse.created(
            data={"component_id": new_component.component_id},
            message="Component created successfully",
        )

    except Exception as e:
        logging.error(f"Error creating component: {e}")
        db.session.rollback()
        return APIResponse.server_error()


@components_bp.route("/component/<int:component_id>", methods=["GET"])
@role_required(["admin"])
@rate_limit(capacity=20, refill_rate=1)
def get_component(component_id):
    try:
        comp = Component.query.get(component_id)
        if not comp:
            return APIResponse.not_found(f"Component {component_id} not found")

        return APIResponse.success(data=_serialize_component(comp))

    except Exception as e:
        logging.error(f"Error retrieving component {component_id}: {e}")
        return APIResponse.server_error("Server error while retrieving component")


@components_bp.route("/component/<int:component_id>", methods=["PUT"])
@role_required(["admin"])
@rate_limit(capacity=20, refill_rate=1)
def update_component(component_id):
    try:
        data = request.form.to_dict()
        files = request.files

        comp = Component.query.get(component_id)
        if not comp:
            return APIResponse.not_found(f"Component {component_id} not found")

        if "title" in data:
            comp.title = data["title"]
        if "order_index" in data:
            comp.order_index = int(data["order_index"])
        if "format_type" in data:
            comp.component_type = data["format_type"]

        deleted_ids = data.get("deleted_item_ids")
        if deleted_ids:
            try:
                for item_id in json.loads(deleted_ids):
                    item = ComponentItem.query.filter_by(
                        item_id=item_id, component_id=comp.component_id
                    ).first()
                    if item:
                        db.session.delete(item)
            except Exception as e:
                logging.error(f"Error parsing deleted_item_ids: {e}")

        items_json = data.get("items")
        if items_json:
            for idx, item_data in enumerate(json.loads(items_json)):
                if not any(item_data.values()):
                    continue

                item_id = item_data.get("item_id")
                if item_id:
                    item = ComponentItem.query.filter_by(
                        item_id=item_id, component_id=comp.component_id
                    ).first()
                    if item:
                        item.title = item_data.get("title", item.title)
                        item.content = item_data.get("content", item.content)
                        item.format_type = item_data.get(
                            "format_type", item.format_type
                        )
                        item.order_index = item_data.get(
                            "order_index", item.order_index
                        )

                        image_val = item_data.get("image")
                        if image_val == "__keep__":
                            pass
                        elif image_val is None:
                            item.image_data = None
                            item.mimetype = None
                        elif image_val in files:
                            file = files[image_val]
                            item.image_data = file.read()
                            item.mimetype = file.mimetype
                else:
                    if (
                        item_data.get("title")
                        or item_data.get("content")
                        or item_data.get("format_type")
                    ):
                        new_item = ComponentItem(
                            component_id=comp.component_id,
                            title=item_data.get("title", f"Item {idx + 1}"),
                            content=item_data.get("content"),
                            format_type=item_data.get("format_type", "content"),
                            order_index=item_data.get("order_index", idx),
                        )
                        image_val = item_data.get("image")
                        if image_val and image_val in files:
                            file = files[image_val]
                            new_item.image_data = file.read()
                            new_item.mimetype = file.mimetype
                        db.session.add(new_item)

        db.session.commit()
        return APIResponse.success(
            data={"component_id": comp.component_id, "title": comp.title},
            message="Component updated successfully",
        )

    except Exception as e:
        logging.error(f"Error updating component {component_id}: {e}")
        db.session.rollback()
        return APIResponse.server_error("Server error while updating component")


@components_bp.route("/component/<int:component_id>", methods=["DELETE"])
@role_required(["admin"])
@rate_limit(capacity=20, refill_rate=1)
def delete_component(component_id):
    try:
        comp = Component.query.get(component_id)
        if not comp:
            return APIResponse.not_found(f"Component {component_id} not found")

        for item in comp.items:
            db.session.delete(item)
        db.session.delete(comp)
        db.session.commit()

        return APIResponse.success(
            data={"component_id": component_id},
            message="Component and its items deleted successfully",
        )

    except Exception as e:
        logging.error(f"Error deleting component {component_id}: {e}")
        db.session.rollback()
        return APIResponse.server_error("Server error while deleting component")
