import json
import logging
from datetime import timedelta,datetime
from flask import Blueprint,request,jsonify
from core.models import db,Subscription,Request,SubscriptionPlan
from core.utils.decorators import role_required
from flask_jwt_extended import get_jwt_identity


subscription_bp = Blueprint("subscription",__name__)

@subscription_bp.route("/allplans", methods=["GET"])
@role_required(["admin", "client"])
def get_all_subscription_plans():
    try:
        plans = SubscriptionPlan.query.all()

        if not plans:
            return jsonify({
                "status": False,
                "message": "No subscription plans found"
            }), 404

        result = []
        for plan in plans:
            result.append({
                "id": plan.id,
                "plan_name": plan.plan_name,
                "no_quizzes": plan.no_quizzes,
                "no_template_exams": plan.no_template_exams,
                "no_topic_quizzes": plan.no_topic_quizzes,
                "duration_days": plan.duration_days,
                "price": plan.price
            })

        return jsonify({
            "status": True,
            "plans": result,
            "count": len(result)
        }), 200

    except Exception as e:
        logging.error(f"Error fetching subscription plans: {e}")
        return jsonify({"status": False, "message": "Server error while fetching plans"}), 500


@subscription_bp.route("/plans/<int:id>", methods=["GET"])
@role_required(["admin"])
def get_subscription_plans(id):
    try:
        plan = SubscriptionPlan.query.get(id)

        if not plan:
            return jsonify({
                "status": False,
                "message": "No subscription plans found"
            }), 404

        result = {
                "id": plan.id,
                "plan_name": plan.plan_name,
                "no_quizzes": plan.no_quizzes,
                "no_template_exams": plan.no_template_exams,
                "no_topic_quizzes": plan.no_topic_quizzes,
                "duration_days": plan.duration_days,
                "price": plan.price,
                "description":plan.description
            }

        return jsonify({
            "status": True,
            "plans": result,
            "count": len(result)
        }), 200

    except Exception as e:
        logging.error(f"Error fetching subscription plans: {e}")
        return jsonify({"status": False, "message": "Server error while fetching plans"}), 500


@subscription_bp.route("/plans", methods=["POST"])
@role_required(["admin"])
def create_subscription_plan():
    try:
        data = request.get_json()
        logging.info(f"Received subscription plan data: {data}")

        new_plan = SubscriptionPlan(
            # optional: if you want to set manually
            plan_name=data.get("name"),
            no_quizzes=data.get("quizzes", 0),
            no_template_exams=data.get("templates", 0),
            no_topic_quizzes=data.get("topic_quizzes", 0),
            duration_days=data.get("duration", 0),
            price=data.get("price", 0),
            description=data.get("description",0)
        )

        db.session.add(new_plan)
        db.session.commit()

        return jsonify({
            "status": True,
            "message": "Subscription plan created successfully",
            # "plan": {
            #     "id": new_plan.id,
            #     "plan_name": new_plan.plan_name,
            #     "no_quizzes": new_plan.no_quizzes,
            #     "no_template_exams": new_plan.no_template_exams,
            #     "no_topic_quizzes": new_plan.no_topic_quizzes,
            #     "duration_days": new_plan.duration_days,
            #     "price": new_plan.price
            # }
        }), 201

    except Exception as e:
        logging.error(f"Error creating subscription plan: {e}")
        db.session.rollback()
        return jsonify({"status": False, "message": "Server error while creating plan"}), 500

@subscription_bp.route("/plans/<int:plan_id>", methods=["PUT"])
@role_required(["admin"])
def update_subscription_plan(plan_id):
    try:
        data = request.get_json()
        logging.info(f"Updating subscription plan {plan_id} with data: {data}")

        plan = SubscriptionPlan.query.get(plan_id)
        if not plan:
            return jsonify({"status": False, "message": f"Subscription plan {plan_id} not found"}), 404

        # Update fields
        plan.plan_name = data.get("name", plan.plan_name)
        plan.price = data.get("price", plan.price)
        plan.duration_days = data.get("duration", plan.duration_days)
        plan.no_quizzes = data.get("quizzes", plan.no_quizzes)
        plan.no_template_exams = data.get("templates", plan.no_template_exams)
        plan.no_topic_quizzes = data.get("topic_quizzes", plan.no_topic_quizzes)

        # If you added description column in SubscriptionPlan
        if hasattr(plan, "description"):
            plan.description = data.get("description", plan.description)

        db.session.commit()

        return jsonify({
            "status": True,
            "message": "Subscription plan updated successfully",
            "plan": {
                "id": plan.id,
                "plan_name": plan.plan_name,
                "price": plan.price,
                "duration_days": plan.duration_days,
                "no_quizzes": plan.no_quizzes,
                "no_template_exams": plan.no_template_exams,
                "no_topic_quizzes": plan.no_topic_quizzes,
                "description": getattr(plan, "description", None)
            }
        }), 200

    except Exception as e:
        logging.error(f"Error updating subscription plan {plan_id}: {e}")
        db.session.rollback()
        return jsonify({"status": False, "message": "Server error while updating plan"}), 500

@subscription_bp.route("/allrequests", methods=["GET"])
@role_required(["admin"])
def get_all_requests():
    try:
        # Order by request_date descending so latest requests come first
        requests = Request.query.order_by(Request.request_date.desc()).all()

        if not requests:
            return jsonify({
                "status": False,
                "message": "No requests found"
            }), 404

        results = []
        for req in requests:
            results.append({
                "id": req.id,
                "user_id": req.user.id,          # ✅ include user_id
                "email": req.user.email,         # ✅ include user email
                "plan_id": req.plan_id,
                "plan_name": req.plan.plan_name, # ✅ include plan name
                "subscription_requested": req.subscription_requested,
                "request_date": req.request_date.isoformat(),  # serialize datetime
                "status": req.status
            })

        return jsonify({
            "status": True,
            "requests": results,
            "count": len(results)
        }), 200

    except Exception as e:
        logging.error(f"Error fetching subscription requests: {e}")
        return jsonify({
            "status": False,
            "message": "Server error while fetching requests"
        }), 500


@subscription_bp.route("/myrequests", methods=["GET"])   # ✅ ensures only authenticated users can access
@role_required(["client"])
def get_user_requests():
    try:
        # ✅ Extract user_id from token
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"status": False, "message": "Unauthorized"}), 401

        # Fetch requests for this user, latest first
        requests = Request.query.filter_by(user_id=user_id).order_by(Request.request_date.desc()).all()

        if not requests:
            return jsonify({
                "status": False,
                "message": "No requests found for this user"
            }), 404

        results = []
        for req in requests:
            results.append({
                "id": req.id,
                "user_id": req.user.id,          # ✅ include user_id
                "email": req.user.email,         # ✅ include user email
                "plan_id": req.plan_id,
                "plan_name": req.plan.plan_name, # ✅ include plan name
                "subscription_requested": req.subscription_requested,
                "request_date": req.request_date.isoformat(),
                "status": req.status
            })

        return jsonify({
            "status": True,
            "requests": results,
            "count": len(results)
        }), 200

    except Exception as e:
        logging.error(f"Error fetching user requests: {e}")
        return jsonify({
            "status": False,
            "message": "Server error while fetching requests"
        }), 500


@subscription_bp.route("/request", methods=["POST"])
@role_required(["client"])
def create_request():
    try:
        data = request.get_json()
        plan_id = data.get("plan_id")

        if not plan_id:
            return jsonify({"status": False, "message": "plan_id is required"}), 400

        # ✅ Extract user_id from token
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"status": False, "message": "Unauthorized"}), 401

        # ✅ Check if user already has a pending request
        existing_request = Request.query.filter_by(user_id=user_id, status="pending").first()
        if existing_request:
            return jsonify({
                "status": False,
                "message": "You already have a pending request. Please wait for it to be processed."
            }), 400

        # ✅ Create new request
        new_request = Request(
            user_id=user_id,
            plan_id=plan_id,
            subscription_requested=True,
            status="pending"
        )

        db.session.add(new_request)
        db.session.commit()

        return jsonify({
            "status": True,
            "message": "Subscription request created successfully",
            "request": {
                "id": new_request.id,
                "user_id": new_request.user.id,
                "email": new_request.user.email,
                "plan_id": new_request.plan_id,
                "plan_name": new_request.plan.plan_name,
                "subscription_requested": new_request.subscription_requested,
                "request_date": new_request.request_date.isoformat(),
                "status": new_request.status
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating subscription request: {e}")
        return jsonify({"status": False, "message": "Server error while creating request"}), 500


@subscription_bp.route("/request/<int:req_id>/cancel", methods=["PUT"])
@role_required(["client"])
def cancel_request(req_id):
    try:
        # ✅ Extract user_id from token
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"status": False, "message": "Unauthorized"}), 401

        # ✅ Find the request
        req = Request.query.get(req_id)
        if not req:
            return jsonify({"status": False, "message": "Request not found"}), 404

        # ✅ Ensure the request belongs to this user
        if req.user_id != int(user_id):
            print(type(req.user_id)," == ",type(user_id))
            logging(f"user ={req.user_id} and token id = {user_id}")
            return jsonify({"status": False, "message": "You can only cancel your own requests"}), 403

        # ✅ Only allow cancel if still pending
        if req.status != "pending":
            return jsonify({"status": False, "message": "Only pending requests can be canceled"}), 400

        # ✅ Update status
        req.status = "canceled"
        db.session.commit()

        return jsonify({
            "status": True,
            "message": "Request canceled successfully",
            "request": {
                "id": req.id,
                "user_id": req.user.id,
                "email": req.user.email,
                "plan_id": req.plan_id,
                "plan_name": req.plan.plan_name,
                "subscription_requested": req.subscription_requested,
                "request_date": req.request_date.isoformat(),
                "status": req.status
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error canceling request {req_id}: {e}")
        return jsonify({"status": False, "message": "Server error while canceling request"}), 500


@subscription_bp.route("/request/<int:req_id>/reject", methods=["PUT"])
@role_required(["admin"])
def reject_request(req_id):
    try:
        # ✅ Find the request
        req = Request.query.get(req_id)
        if not req:
            return jsonify({"status": False, "message": "Request not found"}), 404

        # ✅ Only allow reject if still pending
        if req.status != "pending":
            return jsonify({"status": False, "message": "Only pending requests can be rejected"}), 400

        # ✅ Update status
        req.status = "rejected"
        db.session.commit()

        return jsonify({
            "status": True,
            "message": "Request rejected successfully",
            "request": {
                "id": req.id,
                "user_id": req.user.id,
                "email": req.user.email,
                "plan_id": req.plan_id,
                "plan_name": req.plan.plan_name,
                "subscription_requested": req.subscription_requested,
                "request_date": req.request_date.isoformat(),
                "status": req.status
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error rejecting request {req_id}: {e}")
        return jsonify({"status": False, "message": "Server error while rejecting request"}), 500


@subscription_bp.route("/request/<int:req_id>/approve", methods=["PUT"])
@role_required(["admin"])
def approve_request(req_id):
    try:
        # ✅ Find the request
        req = Request.query.get(req_id)
        if not req:
            return jsonify({"status": False, "message": "Request not found"}), 404

        # ✅ Only allow approve if still pending
        if req.status != "pending":
            return jsonify({"status": False, "message": "Only pending requests can be approved"}), 400

        # ✅ Update request status
        req.status = "approved"

        # ✅ Check if user already has an active subscription
        active_sub = Subscription.query.filter_by(
            user_id=req.user_id, active=True
        ).order_by(Subscription.expiry_date.desc()).first()

        plan = req.plan
        now = datetime.utcnow()

        # 🔹 If subscription exists, check expiry and active
        if active_sub:
            if active_sub.expiry_date <= now:
                # Expired → deactivate
                active_sub.active = False
                db.session.commit()
                active_sub = None  # force new subscription creation

        if active_sub and active_sub.active and active_sub.expiry_date > now:
            # 🔹 Upgrade existing subscription
            active_sub.expiry_date = active_sub.expiry_date + timedelta(days=plan.duration_days)
            active_sub.remaining_quizzes += plan.no_quizzes
            active_sub.remaining_template_exams += plan.no_template_exams
            active_sub.remaining_topic_quizzes += plan.no_topic_quizzes
            active_sub.req_id = req.id
            db.session.commit()

            return jsonify({
                "status": True,
                "message": "Request approved and subscription upgraded successfully",
                "subscription_id": active_sub.id
            }), 200

        else:
            # 🔹 Create new subscription
            new_subscription = Subscription(
                user_id=req.user_id,
                plan_id=req.plan_id,
                req_id=req.id,
                start_date=now,
                expiry_date=now + timedelta(days=plan.duration_days),
                active=True,
                remaining_quizzes=plan.no_quizzes,
                remaining_template_exams=plan.no_template_exams,
                remaining_topic_quizzes=plan.no_topic_quizzes
            )

            db.session.add(new_subscription)
            db.session.commit()

            return jsonify({
                "status": True,
                "message": "Request approved and new subscription created successfully",
                "subscription_id": new_subscription.id
            }), 200

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error approving request {req_id}: {e}")
        return jsonify({"status": False, "message": "Server error while approving request"}), 500

@subscription_bp.route("/my-subscription", methods=["GET"])
@role_required(["client"])
def get_latest_subscription():
    try:
        # ✅ Extract user_id from token
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"status": False, "message": "Unauthorized"}), 401

        # ✅ Fetch the most recent subscription for this user
        sub = Subscription.query.filter_by(user_id=user_id).order_by(Subscription.expiry_date.desc()).first()

        if not sub:
            return jsonify({"status": False, "message": "No subscriptions found"}), 404

        # ✅ Check expiry and deactivate if needed
        now = datetime.utcnow()
        if sub.expiry_date <= now and sub.active:
            sub.active = False
            db.session.commit()

        return jsonify({
            "status": True,
            "subscription": {
                # "id": sub.id,
                # "user_id": sub.user_id,
                # "email": sub.user.email,
                # "plan_id": sub.plan_id,
                "plan_name": sub.plan.plan_name,
                "req_id": sub.req_id,
                # "start_date": sub.start_date.isoformat(),
                "expiry_date": sub.expiry_date.isoformat(),
                "active": sub.active,
                "remaining_quizzes": sub.remaining_quizzes,
                "remaining_template_exams": sub.remaining_template_exams,
                "remaining_topic_quizzes": sub.remaining_topic_quizzes
            }
        }), 200

    except Exception as e:
        logging.error(f"Error fetching latest subscription for user {user_id}: {e}")
        return jsonify({"status": False, "message": "Server error while fetching subscription"}), 500


@subscription_bp.route("/all-subscriptions", methods=["GET"])
@role_required(["admin"])
def get_all_subscriptions():
    try:
        # ✅ Order by expiry_date descending so latest subscriptions come first
        subscriptions = Subscription.query.order_by(Subscription.expiry_date.desc()).all()

        if not subscriptions:
            return jsonify({
                "status": False,
                "message": "No subscriptions found"
            }), 404

        results = []
        now = datetime.utcnow()

        for sub in subscriptions:
            # ✅ Auto-deactivate expired subscriptions
            if sub.expiry_date <= now and sub.active:
                sub.active = False
                db.session.commit()

            results.append({
                "id": sub.id,
                "user_id": sub.user.id,
                "email": sub.user.email,
                "plan_id": sub.plan_id,
                "plan_name": sub.plan.plan_name,
                "req_id": sub.req_id,
                "start_date": sub.start_date.isoformat(),
                "expiry_date": sub.expiry_date.isoformat(),
                "active": sub.active,

                # ✅ Current remaining quotas
                "remaining_quizzes": sub.remaining_quizzes,
                "remaining_template_exams": sub.remaining_template_exams,
                "remaining_topic_quizzes": sub.remaining_topic_quizzes,

                # # ✅ Original plan quotas
                # "plan_no_quizzes": sub.plan.no_quizzes,
                # "plan_no_template_exams": sub.plan.no_template_exams,
                # "plan_no_topic_quizzes": sub.plan.no_topic_quizzes
            })

        return jsonify({
            "status": True,
            "subscriptions": results,
            "count": len(results)
        }), 200

    except Exception as e:
        logging.error(f"Error fetching subscriptions: {e}")
        return jsonify({
            "status": False,
            "message": "Server error while fetching subscriptions"
        }), 500


@subscription_bp.route("/subscription/<int:sub_id>", methods=["GET"])
@role_required(["admin"])
def get_subscription(sub_id):
    try:
        # ✅ Find the subscription
        sub = Subscription.query.get(sub_id)
        if not sub:
            return jsonify({"status": False, "message": "Subscription not found"}), 404

        # ✅ Check expiry and deactivate if needed
        now = datetime.utcnow()
        if sub.expiry_date <= now and sub.active:
            sub.active = False
            db.session.commit()

        # ✅ Build response with all details
        result = {
            "id": sub.id,
            "user_id": sub.user.id,
            "email": sub.user.email,
            "plan_id": sub.plan_id,
            "plan_name": sub.plan.plan_name,
            "req_id": sub.req_id,
            "start_date": sub.start_date.isoformat(),
            "expiry_date": sub.expiry_date.isoformat(),
            "active": sub.active,

            # Current remaining quotas
            "remaining_quizzes": sub.remaining_quizzes,
            "remaining_template_exams": sub.remaining_template_exams,
            "remaining_topic_quizzes": sub.remaining_topic_quizzes,

            # Original plan quotas
            "plan_no_quizzes": sub.plan.no_quizzes,
            "plan_no_template_exams": sub.plan.no_template_exams,
            "plan_no_topic_quizzes": sub.plan.no_topic_quizzes
        }

        return jsonify({"status": True, "subscription": result}), 200

    except Exception as e:
        logging.error(f"Error fetching subscription {sub_id}: {e}")
        return jsonify({"status": False, "message": "Server error while fetching subscription"}), 500


@subscription_bp.route("/subscription/<int:sub_id>/status", methods=["PUT"])
@role_required(["admin"])
def toggle_subscription_status(sub_id):
    try:
        data = request.get_json()
        action = data.get("action")  # expected values: "activate" or "deactivate"

        if action not in ["activate", "deactivate"]:
            return jsonify({"status": False, "message": "Invalid action. Use 'activate' or 'deactivate'"}), 400

        # ✅ Find the subscription
        sub = Subscription.query.get(sub_id)
        if not sub:
            return jsonify({"status": False, "message": "Subscription not found"}), 404

        now = datetime.utcnow()

        if action == "deactivate":
            if not sub.active:
                return jsonify({"status": False, "message": "Subscription is already inactive"}), 400

            sub.active = False
            db.session.commit()

            return jsonify({
                "status": True,
                "message": "Subscription deactivated successfully",
                "subscription_id": sub.id,
                "active": sub.active
            }), 200

        elif action == "activate":
            if sub.active:
                return jsonify({"status": False, "message": "Subscription is already active"}), 400

            if sub.expiry_date <= now:
                return jsonify({"status": False, "message": "Cannot activate expired subscription"}), 400

            sub.active = True
            db.session.commit()

            return jsonify({
                "status": True,
                "message": "Subscription activated successfully",
                "subscription_id": sub.id,
                "active": sub.active
            }), 200

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error toggling subscription {sub_id}: {e}")
        return jsonify({"status": False, "message": "Server error while updating subscription status"}), 500


@subscription_bp.route("/user/<int:user_id>/history", methods=["GET"])
@role_required(["admin"])   # ✅ only admins can view any user's history
def get_user_history(user_id):
    try:
        # ✅ Fetch all requests for this user, latest first
        requests = Request.query.filter_by(user_id=user_id).order_by(Request.request_date.desc()).all()

        # ✅ Fetch all subscriptions for this user, latest first
        subscriptions = Subscription.query.filter_by(user_id=user_id).order_by(Subscription.expiry_date.desc()).all()

        if not requests and not subscriptions:
            return jsonify({"status": False, "message": "No history found for this user"}), 404

        now = datetime.utcnow()

        # ✅ Build requests list
        request_list = []
        for req in requests:
            request_list.append({
                "id": req.id,
                "plan_id": req.plan_id,
                "plan_name": req.plan.plan_name,
                "request_date": req.request_date.isoformat(),
                "status": req.status,
                "subscription_requested": req.subscription_requested
            })

        # ✅ Build subscriptions list
        subscription_list = []
        for sub in subscriptions:
            # Auto-deactivate expired subscriptions
            if sub.expiry_date <= now and sub.active:
                sub.active = False
                db.session.commit()

            subscription_list.append({
                "id": sub.id,
                "plan_id": sub.plan_id,
                "plan_name": sub.plan.plan_name,
                "req_id": sub.req_id,
                "start_date": sub.start_date.isoformat(),
                "expiry_date": sub.expiry_date.isoformat(),
                "active": sub.active,
                "remaining_quizzes": sub.remaining_quizzes,
                "remaining_template_exams": sub.remaining_template_exams,
                "remaining_topic_quizzes": sub.remaining_topic_quizzes,
                "plan_no_quizzes": sub.plan.no_quizzes,
                "plan_no_template_exams": sub.plan.no_template_exams,
                "plan_no_topic_quizzes": sub.plan.no_topic_quizzes
            })

        return jsonify({
            "status": True,
            "user_id": user_id,
            "requests": request_list,
            "subscriptions": subscription_list,
            "request_count": len(request_list),
            "subscription_count": len(subscription_list)
        }), 200

    except Exception as e:
        logging.error(f"Error fetching history for user {user_id}: {e}")
        return jsonify({"status": False, "message": "Server error while fetching user history"}), 500


@subscription_bp.route("/users-subscriptions", methods=["GET"])
@role_required(["admin"])
def get_users_subscriptions():
    try:
        # ✅ Fetch all subscriptions, latest expiry first
        subscriptions = Subscription.query.order_by(Subscription.expiry_date.desc()).all()

        if not subscriptions:
            return jsonify({"status": False, "message": "No subscriptions found"}), 404

        now = datetime.utcnow()
        results = []

        for sub in subscriptions:
            # Auto-deactivate expired subscriptions
            if sub.expiry_date <= now and sub.active:
                sub.active = False
                db.session.commit()

            results.append({
                "user_id": sub.user.id,
                "email": sub.user.email,
                "active_plan": sub.plan.plan_name,
                "active":sub.active,
                "status": "Active" if sub.active else "Expired"
            })

        return jsonify({
            "status": True,
            "users": results,
            "count": len(results)
        }), 200

    except Exception as e:
        logging.error(f"Error fetching users subscriptions: {e}")
        return jsonify({"status": False, "message": "Server error while fetching users subscriptions"}), 500
