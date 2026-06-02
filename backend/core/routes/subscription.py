import logging
from datetime import timedelta, datetime
from flask import Blueprint, request
from core.models import db, Subscription, Request, SubscriptionPlan
from core.utils.decorators import role_required, rate_limit, APIResponse
from flask_jwt_extended import get_jwt_identity


subscription_bp = Blueprint("subscription", __name__)


# ─── Serializer helpers ───────────────────────────────────────────────────────

def _serialize_plan(plan, include_description=False):
    data = {
        "id": plan.id,
        "plan_name": plan.plan_name,
        "no_quizzes": plan.no_quizzes,
        "no_template_exams": plan.no_template_exams,
        "no_topic_quizzes": plan.no_topic_quizzes,
        "duration_days": plan.duration_days,
        "price": plan.price,
    }
    if include_description:
        data["description"] = getattr(plan, "description", None)
    return data


def _serialize_request(req):
    return {
        "id": req.id,
        "user_id": req.user.id,
        "email": req.user.email,
        "plan_id": req.plan_id,
        "plan_name": req.plan.plan_name,
        "subscription_requested": req.subscription_requested,
        "request_date": req.request_date.isoformat(),
        "status": req.status,
    }


def _serialize_subscription(sub, include_plan_quotas=False):
    data = {
        "id": sub.id,
        "user_id": sub.user.id,
        "email": sub.user.email,
        "plan_id": sub.plan_id,
        "plan_name": sub.plan.plan_name,
        "req_id": sub.req_id,
        "start_date": sub.start_date.isoformat(),
        "expiry_date": sub.expiry_date.isoformat(),
        "active": sub.active,
        "remaining_quizzes": sub.remaining_quizzes,
        "remaining_template_exams": sub.remaining_template_exams,
        "remaining_topic_quizzes": sub.remaining_topic_quizzes,
    }
    if include_plan_quotas:
        data.update({
            "plan_no_quizzes": sub.plan.no_quizzes,
            "plan_no_template_exams": sub.plan.no_template_exams,
            "plan_no_topic_quizzes": sub.plan.no_topic_quizzes,
        })
    return data


def _auto_deactivate(sub):
    """Deactivate sub in-place if expired. Returns True if deactivated."""
    if sub.expiry_date <= datetime.utcnow() and sub.active:
        sub.active = False
        db.session.commit()
        return True
    return False


# ─── Plans ────────────────────────────────────────────────────────────────────

@subscription_bp.route("/allplans", methods=["GET"])
@role_required(["admin", "client"])
@rate_limit(capacity=5, refill_rate=1)
def get_all_subscription_plans():
    try:
        plans = SubscriptionPlan.query.all()
        if not plans:
            return APIResponse.not_found("No subscription plans found")

        data = [_serialize_plan(p) for p in plans]
        return APIResponse.success(data=data, meta={"count": len(data)})

    except Exception as e:
        logging.error(f"Error fetching subscription plans: {e}")
        return APIResponse.server_error("Server error while fetching plans")


@subscription_bp.route("/plans/<int:id>", methods=["GET"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1)
def get_subscription_plan(id):
    try:
        plan = SubscriptionPlan.query.get(id)
        if not plan:
            return APIResponse.not_found("Subscription plan not found")

        return APIResponse.success(data=_serialize_plan(plan, include_description=True))

    except Exception as e:
        logging.error(f"Error fetching subscription plan: {e}")
        return APIResponse.server_error("Server error while fetching plan")


@subscription_bp.route("/plans", methods=["POST"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1)
def create_subscription_plan():
    try:
        data = request.get_json()
        if not data:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        new_plan = SubscriptionPlan(
            plan_name=data.get("name"),
            no_quizzes=data.get("quizzes", 0),
            no_template_exams=data.get("templates", 0),
            no_topic_quizzes=data.get("topic_quizzes", 0),
            duration_days=data.get("duration", 0),
            price=data.get("price", 0),
            description=data.get("description", ""),
        )
        db.session.add(new_plan)
        db.session.commit()

        return APIResponse.created(
            data={"id": new_plan.id},
            message="Subscription plan created successfully",
        )

    except Exception as e:
        logging.error(f"Error creating subscription plan: {e}")
        db.session.rollback()
        return APIResponse.server_error("Server error while creating plan")


@subscription_bp.route("/plans/<int:plan_id>", methods=["PUT"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1)
def update_subscription_plan(plan_id):
    try:
        data = request.get_json()
        if not data:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        plan = SubscriptionPlan.query.get(plan_id)
        if not plan:
            return APIResponse.not_found(f"Subscription plan {plan_id} not found")

        plan.plan_name = data.get("name", plan.plan_name)
        plan.price = data.get("price", plan.price)
        plan.duration_days = data.get("duration", plan.duration_days)
        plan.no_quizzes = data.get("quizzes", plan.no_quizzes)
        plan.no_template_exams = data.get("templates", plan.no_template_exams)
        plan.no_topic_quizzes = data.get("topic_quizzes", plan.no_topic_quizzes)
        if hasattr(plan, "description"):
            plan.description = data.get("description", plan.description)

        db.session.commit()
        return APIResponse.success(
            data=_serialize_plan(plan, include_description=True),
            message="Subscription plan updated successfully",
        )

    except Exception as e:
        logging.error(f"Error updating subscription plan {plan_id}: {e}")
        db.session.rollback()
        return APIResponse.server_error("Server error while updating plan")


# ─── Requests ─────────────────────────────────────────────────────────────────

@subscription_bp.route("/allrequests", methods=["GET"])
@role_required(["admin"])
@rate_limit(capacity=10, refill_rate=1)
def get_all_requests():
    try:
        reqs = Request.query.order_by(Request.request_date.desc()).all()
        if not reqs:
            return APIResponse.not_found("No requests found")

        data = [_serialize_request(r) for r in reqs]
        return APIResponse.success(data=data, meta={"count": len(data)})

    except Exception as e:
        logging.error(f"Error fetching subscription requests: {e}")
        return APIResponse.server_error("Server error while fetching requests")


@subscription_bp.route("/myrequests", methods=["GET"])
@role_required(["client"])
@rate_limit(capacity=5, refill_rate=1)
def get_user_requests():
    try:
        user_id = get_jwt_identity()
        reqs = (
            Request.query
            .filter_by(user_id=user_id)
            .order_by(Request.request_date.desc())
            .all()
        )
        if not reqs:
            return APIResponse.not_found("No requests found for this user")

        data = [_serialize_request(r) for r in reqs]
        return APIResponse.success(data=data, meta={"count": len(data)})

    except Exception as e:
        logging.error(f"Error fetching user requests: {e}")
        return APIResponse.server_error("Server error while fetching requests")


@subscription_bp.route("/request", methods=["POST"])
@role_required(["client"])
@rate_limit(capacity=5, refill_rate=1)
def create_request():
    try:
        data = request.get_json()
        if not data:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        plan_id = data.get("plan_id")
        if not plan_id:
            return APIResponse.bad_request("plan_id is required")

        user_id = get_jwt_identity()
        existing = Request.query.filter_by(user_id=user_id, status="pending").first()
        if existing:
            return APIResponse.conflict(
                "You already have a pending request. Please wait for it to be processed."
            )

        new_request = Request(
            user_id=user_id,
            plan_id=plan_id,
            subscription_requested=True,
            status="pending",
        )
        db.session.add(new_request)
        db.session.commit()

        return APIResponse.created(
            data=_serialize_request(new_request),
            message="Subscription request created successfully",
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating subscription request: {e}")
        return APIResponse.server_error("Server error while creating request")


@subscription_bp.route("/request/<int:req_id>/cancel", methods=["PUT"])
@role_required(["client"])
@rate_limit(capacity=5, refill_rate=1)
def cancel_request(req_id):
    try:
        user_id = get_jwt_identity()
        req = Request.query.get(req_id)
        if not req:
            return APIResponse.not_found("Request not found")

        if req.user_id != int(user_id):
            return APIResponse.forbidden("You can only cancel your own requests")

        if req.status != "pending":
            return APIResponse.bad_request("Only pending requests can be canceled")

        req.status = "canceled"
        db.session.commit()
        return APIResponse.success(
            data=_serialize_request(req),
            message="Request canceled successfully",
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error canceling request {req_id}: {e}")
        return APIResponse.server_error("Server error while canceling request")


@subscription_bp.route("/request/<int:req_id>/reject", methods=["PUT"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1)
def reject_request(req_id):
    try:
        req = Request.query.get(req_id)
        if not req:
            return APIResponse.not_found("Request not found")

        if req.status != "pending":
            return APIResponse.bad_request("Only pending requests can be rejected")

        req.status = "rejected"
        db.session.commit()
        return APIResponse.success(
            data=_serialize_request(req),
            message="Request rejected successfully",
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error rejecting request {req_id}: {e}")
        return APIResponse.server_error("Server error while rejecting request")


@subscription_bp.route("/request/<int:req_id>/approve", methods=["PUT"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1)
def approve_request(req_id):
    try:
        req = Request.query.get(req_id)
        if not req:
            return APIResponse.not_found("Request not found")

        if req.status != "pending":
            return APIResponse.bad_request("Only pending requests can be approved")

        req.status = "approved"
        plan = req.plan
        now = datetime.utcnow()

        active_sub = (
            Subscription.query
            .filter_by(user_id=req.user_id, active=True)
            .order_by(Subscription.expiry_date.desc())
            .first()
        )

        if active_sub and active_sub.expiry_date <= now:
            active_sub.active = False
            db.session.commit()
            active_sub = None

        if active_sub:
            active_sub.expiry_date += timedelta(days=plan.duration_days)
            active_sub.remaining_quizzes += plan.no_quizzes
            active_sub.remaining_template_exams += plan.no_template_exams
            active_sub.remaining_topic_quizzes += plan.no_topic_quizzes
            active_sub.req_id = req.id
            db.session.commit()

            return APIResponse.success(
                data={"subscription_id": active_sub.id},
                message="Request approved and subscription upgraded successfully",
            )
        else:
            new_sub = Subscription(
                user_id=req.user_id,
                plan_id=req.plan_id,
                req_id=req.id,
                start_date=now,
                expiry_date=now + timedelta(days=plan.duration_days),
                active=True,
                remaining_quizzes=plan.no_quizzes,
                remaining_template_exams=plan.no_template_exams,
                remaining_topic_quizzes=plan.no_topic_quizzes,
            )
            db.session.add(new_sub)
            db.session.commit()

            return APIResponse.created(
                data={"subscription_id": new_sub.id},
                message="Request approved and new subscription created successfully",
            )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error approving request {req_id}: {e}")
        return APIResponse.server_error("Server error while approving request")


# ─── Subscriptions ────────────────────────────────────────────────────────────

@subscription_bp.route("/my-subscription", methods=["GET"])
@role_required(["client"])
@rate_limit(capacity=5, refill_rate=1)
def get_latest_subscription():
    try:
        user_id = get_jwt_identity()
        sub = (
            Subscription.query
            .filter_by(user_id=user_id)
            .order_by(Subscription.expiry_date.desc())
            .first()
        )
        if not sub:
            return APIResponse.not_found("No subscriptions found")

        _auto_deactivate(sub)

        return APIResponse.success(data={
            "plan_name": sub.plan.plan_name,
            "req_id": sub.req_id,
            "expiry_date": sub.expiry_date.isoformat(),
            "active": sub.active,
            "remaining_quizzes": sub.remaining_quizzes,
            "remaining_template_exams": sub.remaining_template_exams,
            "remaining_topic_quizzes": sub.remaining_topic_quizzes,
        })

    except Exception as e:
        logging.error(f"Error fetching latest subscription: {e}")
        return APIResponse.server_error("Server error while fetching subscription")


@subscription_bp.route("/all-subscriptions", methods=["GET"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1)
def get_all_subscriptions():
    try:
        subscriptions = Subscription.query.order_by(Subscription.expiry_date.desc()).all()
        if not subscriptions:
            return APIResponse.not_found("No subscriptions found")

        for sub in subscriptions:
            _auto_deactivate(sub)

        data = [_serialize_subscription(s) for s in subscriptions]
        return APIResponse.success(data=data, meta={"count": len(data)})

    except Exception as e:
        logging.error(f"Error fetching subscriptions: {e}")
        return APIResponse.server_error("Server error while fetching subscriptions")


@subscription_bp.route("/subscription/<int:sub_id>", methods=["GET"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1)
def get_subscription(sub_id):
    try:
        sub = Subscription.query.get(sub_id)
        if not sub:
            return APIResponse.not_found("Subscription not found")

        _auto_deactivate(sub)
        return APIResponse.success(data=_serialize_subscription(sub, include_plan_quotas=True))

    except Exception as e:
        logging.error(f"Error fetching subscription {sub_id}: {e}")
        return APIResponse.server_error("Server error while fetching subscription")


@subscription_bp.route("/subscription/<int:sub_id>/status", methods=["PUT"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1)
def toggle_subscription_status(sub_id):
    try:
        data = request.get_json()
        action = data.get("action") if data else None

        if action not in ["activate", "deactivate"]:
            return APIResponse.bad_request("Invalid action. Use 'activate' or 'deactivate'")

        sub = Subscription.query.get(sub_id)
        if not sub:
            return APIResponse.not_found("Subscription not found")

        if action == "deactivate":
            if not sub.active:
                return APIResponse.bad_request("Subscription is already inactive")
            sub.active = False
            db.session.commit()
            return APIResponse.success(
                data={"subscription_id": sub.id, "active": sub.active},
                message="Subscription deactivated successfully",
            )

        else:  # activate
            if sub.active:
                return APIResponse.bad_request("Subscription is already active")
            if sub.expiry_date <= datetime.utcnow():
                return APIResponse.bad_request("Cannot activate an expired subscription")
            sub.active = True
            db.session.commit()
            return APIResponse.success(
                data={"subscription_id": sub.id, "active": sub.active},
                message="Subscription activated successfully",
            )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error toggling subscription {sub_id}: {e}")
        return APIResponse.server_error("Server error while updating subscription status")


@subscription_bp.route("/user/<int:user_id>/history", methods=["GET"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1)
def get_user_history(user_id):
    try:
        reqs = Request.query.filter_by(user_id=user_id).order_by(Request.request_date.desc()).all()
        subs = Subscription.query.filter_by(user_id=user_id).order_by(Subscription.expiry_date.desc()).all()

        if not reqs and not subs:
            return APIResponse.not_found("No history found for this user")

        for sub in subs:
            _auto_deactivate(sub)

        return APIResponse.success(data={
            "user_id": user_id,
            "requests": [_serialize_request(r) for r in reqs],
            "subscriptions": [_serialize_subscription(s, include_plan_quotas=True) for s in subs],
        }, meta={
            "request_count": len(reqs),
            "subscription_count": len(subs),
        })

    except Exception as e:
        logging.error(f"Error fetching history for user {user_id}: {e}")
        return APIResponse.server_error("Server error while fetching user history")


@subscription_bp.route("/users-subscriptions", methods=["GET"])
@role_required(["admin"])
@rate_limit(capacity=5, refill_rate=1)
def get_users_subscriptions():
    try:
        subscriptions = Subscription.query.order_by(Subscription.expiry_date.desc()).all()
        if not subscriptions:
            return APIResponse.not_found("No subscriptions found")

        for sub in subscriptions:
            _auto_deactivate(sub)

        data = [
            {
                "user_id": sub.user.id,
                "email": sub.user.email,
                "active_plan": sub.plan.plan_name,
                "active": sub.active,
                "status": "Active" if sub.active else "Expired",
            }
            for sub in subscriptions
        ]
        return APIResponse.success(data=data, meta={"count": len(data)})

    except Exception as e:
        logging.error(f"Error fetching users subscriptions: {e}")
        return APIResponse.server_error("Server error while fetching users subscriptions")