from functools import wraps
from flask import jsonify
from flask import g
from datetime import datetime
from core.models import db,Subscription
from flask_jwt_extended import verify_jwt_in_request, get_jwt,get_jwt_identity
import logging



def role_required(required_roles):
    """
    Decorator to restrict route access by user role.
    Accepts a single role string or a list of roles.
    """
    if isinstance(required_roles, str):
        required_roles = [required_roles]

    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")

            if user_role not in required_roles:
                return jsonify({
                    "status": False,
                    "error": f"Access denied: requires one of {required_roles}"
                }), 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper



def subscription_required(resource_type):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                user_id = get_jwt_identity()
                if not user_id:
                    return jsonify({"status": False, "message": "Unauthorized"}), 401

                sub = Subscription.query.filter_by(user_id=user_id).order_by(Subscription.expiry_date.desc()).first()
                if not sub:
                    return jsonify({"status": False, "message": "No subscription found"}), 403

                now = datetime.utcnow()
                if sub.expiry_date <= now:
                    sub.active = False
                    db.session.commit()
                    return jsonify({"status": False, "message": "Your subscription has expired"}), 403

                if not sub.active:
                    return jsonify({"status": False, "message": "No active subscription"}), 403

                # ✅ Resource availability check
                if resource_type == "quizzes" and sub.remaining_quizzes <= 0:
                    return jsonify({"status": False, "message": "No quizzes remaining"}), 403
                elif resource_type == "template_exams" and sub.remaining_template_exams <= 0:
                    return jsonify({"status": False, "message": "No template exams remaining"}), 403
                elif resource_type == "topic_quizzes" and sub.remaining_topic_quizzes <= 0:
                    return jsonify({"status": False, "message": "No topic quizzes remaining"}), 403

                # ✅ Store subscription in request context
                g.subscription = sub

                return fn(*args, **kwargs)

            except Exception as e:
                logging.error(f"Subscription check error: {e}")
                return jsonify({"status": False, "message": "Server error during subscription check"}), 500

        return wrapper
    return decorator
