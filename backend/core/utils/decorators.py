from functools import wraps
from flask import jsonify
from flask import g
from datetime import datetime
from core.models import db,Subscription
from flask_jwt_extended import verify_jwt_in_request, get_jwt,get_jwt_identity
import logging
import time



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

                claims = get_jwt()
                role = claims.get("role")

                # ✅ Admins bypass subscription checks
                if role == "admin":
                    return fn(*args, **kwargs)

                # Normal subscription enforcement for clients
                sub = Subscription.query.filter_by(user_id=user_id).order_by(Subscription.expiry_date.desc()).first()
                if not sub:
                    print(f"No subscription found for user_id {user_id}")
                    return jsonify({"status": False, "message": "No subscription found"}), 403

                now = datetime.utcnow()
                if sub.expiry_date <= now:
                    sub.active = False
                    db.session.commit()
                    print(f"Subscription expired for user_id {user_id} at {sub.expiry_date}")
                    return jsonify({"status": False, "message": "Your subscription has expired"}), 403

                if not sub.active:
                    print(f"Inactive subscription for user_id {user_id}")
                    return jsonify({"status": False, "message": "Your subscription is inactive"}), 403

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
                print(f"Subscription check error: {e}")
                logging.error(f"Subscription check error: {e}")
                return jsonify({"status": False, "message": "Server error during subscription check"}), 500

        return wrapper
    return decorator



# Store buckets per user
buckets = {}

class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate  # tokens per second
        self.last_refill = time.time()

    def consume(self, num_tokens=1):
        now = time.time()
        elapsed = now - self.last_refill

        # refill based on elapsed time
        refill_amount = elapsed * self.refill_rate
        self.tokens = min(self.capacity, self.tokens + refill_amount)
        self.last_refill = now

        if self.tokens >= num_tokens:
            self.tokens -= num_tokens
            return True
        return False

def rate_limit(capacity=10, refill_rate=1):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            if user_id not in buckets:
                buckets[user_id] = TokenBucket(capacity, refill_rate)

            bucket = buckets[user_id]
            if bucket.consume():
                return fn(*args, **kwargs)
            else:
                return jsonify({"status": False, "message": "Rate limit exceeded"}), 429
        return wrapper
    return decorator
