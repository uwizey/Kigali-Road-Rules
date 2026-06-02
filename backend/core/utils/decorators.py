from functools import wraps
from user_agents import parse
from flask import g
import json
from datetime import datetime, timezone
from flask import request, Response
from flask import jsonify
from core.models import db, Subscription, AnalyticsEvent
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity
import logging
import time
import threading


class APIResponse:
    """Standardized API Response wrapper for Flask."""

    @staticmethod
    def _build(status: str, message: str, data, error, meta: dict | None) -> dict:
        payload = {
            "status": status,
            "message": message,
            "data": data,
            "error": error,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        if meta:
            payload["meta"] = meta
        return payload

    @staticmethod
    def success(
        data=None,
        message: str = "Success",
        status_code: int = 200,
        meta: dict | None = None,
    ) -> Response:
        return (
            jsonify(APIResponse._build("success", message, data, None, meta)),
            status_code,
        )

    @staticmethod
    def created(
        data=None, message: str = "Created", meta: dict | None = None
    ) -> Response:
        return APIResponse.success(
            data=data, message=message, status_code=201, meta=meta
        )

    @staticmethod
    def error(
        message: str = "An error occurred",
        error_details=None,
        status_code: int = 400,
        meta: dict | None = None,
    ) -> Response:
        return (
            jsonify(APIResponse._build("error", message, None, error_details, meta)),
            status_code,
        )

    @staticmethod
    def bad_request(message: str = "Bad request", error_details=None) -> Response:
        return APIResponse.error(message, error_details, status_code=400)

    @staticmethod
    def unauthorized(message: str = "Unauthorized") -> Response:
        return APIResponse.error(message, status_code=401)

    @staticmethod
    def forbidden(message: str = "Forbidden") -> Response:
        return APIResponse.error(message, status_code=403)

    @staticmethod
    def not_found(message: str = "Resource not found") -> Response:
        return APIResponse.error(message, status_code=404)

    @staticmethod
    def conflict(message: str = "Conflict", error_details=None) -> Response:
        return APIResponse.error(message, error_details, status_code=409)

    @staticmethod
    def server_error(
        message: str = "Internal server error", error_details=None
    ) -> Response:
        return APIResponse.error(message, error_details, status_code=500)

    @staticmethod
    def rate_limited(retry_after: int) -> Response:
        response, status = APIResponse.error("Rate limit exceeded", status_code=429)
        response.headers["Retry-After"] = retry_after
        return response, status


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
                return APIResponse.forbidden(
                    f"Access denied: requires one of {required_roles}"
                )

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
                    return APIResponse.unauthorized()

                claims = get_jwt()
                role = claims.get("role")

                if role == "admin":
                    return fn(*args, **kwargs)

                sub = (
                    Subscription.query.filter_by(user_id=user_id)
                    .order_by(Subscription.expiry_date.desc())
                    .first()
                )
                if not sub:
                    return APIResponse.forbidden("No subscription found")

                now = datetime.utcnow()
                if sub.expiry_date <= now:
                    sub.active = False
                    db.session.commit()
                    return APIResponse.forbidden("Your subscription has expired")

                if not sub.active:
                    return APIResponse.forbidden("Your subscription is inactive")

                resource_limits = {
                    "quizzes": (sub.remaining_quizzes, "No quizzes remaining"),
                    "template_exams": (
                        sub.remaining_template_exams,
                        "No template exams remaining",
                    ),
                    "topic_quizzes": (
                        sub.remaining_topic_quizzes,
                        "No topic quizzes remaining",
                    ),
                }

                if resource_type in resource_limits:
                    remaining, msg = resource_limits[resource_type]
                    if remaining <= 0:
                        return APIResponse.forbidden(msg)

                g.subscription = sub
                return fn(*args, **kwargs)

            except Exception as e:
                logging.error(f"Subscription check error: {e}")
                return APIResponse.server_error(
                    "Server error during subscription check"
                )

        return wrapper

    return decorator


_bucket_lock = threading.Lock()
_buckets = {}
_BUCKET_TTL = 3600


class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate
        self.last_refill = time.time()
        self.last_used = time.time()
        self._lock = threading.Lock()

    def consume(self, num_tokens=1):
        with self._lock:
            now = time.time()
            elapsed = now - self.last_refill
            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
            self.last_refill = now
            self.last_used = now

            if self.tokens >= num_tokens:
                self.tokens -= num_tokens
                return True
            return False


def _cleanup_buckets():
    now = time.time()
    with _bucket_lock:
        stale = [uid for uid, b in _buckets.items() if now - b.last_used > _BUCKET_TTL]
        for uid in stale:
            del _buckets[uid]


def rate_limit(capacity=10, refill_rate=1):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            with _bucket_lock:
                if user_id not in _buckets:
                    _buckets[user_id] = TokenBucket(capacity, refill_rate)
                bucket = _buckets[user_id]

            if bucket.consume():
                return fn(*args, **kwargs)

            retry_after = int(1.0 / bucket.refill_rate)
            return APIResponse.rate_limited(retry_after)

        return wrapper

    return decorator


def track_event(default_event_type):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            result = fn(*args, **kwargs)

            try:
                user_id = None
                try:
                    user_id = get_jwt_identity()
                except Exception:
                    pass

                ua_string = request.headers.get("User-Agent", "")
                parsed_ua = parse(ua_string)

                if parsed_ua.is_mobile:
                    device_type = "mobile"
                elif parsed_ua.is_tablet:
                    device_type = "tablet"
                elif parsed_ua.is_pc:
                    device_type = "desktop"
                else:
                    device_type = "other"

                event_type = default_event_type
                metadata = {}

                if isinstance(result, dict):
                    event_type = result.pop("_event_type", default_event_type)
                    metadata = result.pop("_event_metadata", {})

                event_metadata = {
                    "path": request.path,
                    "method": request.method,
                    "args": request.args.to_dict(),
                    "json": request.get_json(silent=True),
                    "user_agent": ua_string,
                    **metadata,
                }

                event = AnalyticsEvent(
                    user_id=user_id,
                    event_type=event_type,
                    event_metadata=json.dumps(event_metadata),
                    device=device_type,
                    os=parsed_ua.os.family or "unknown",
                    browser=parsed_ua.browser.family or "unknown",
                    ip_address=request.remote_addr,
                )

                db.session.add(event)
                db.session.commit()
                logging.info(
                    f"Logged event: {event_type} for user_id: {user_id}, device: {device_type}"
                )

            except Exception as e:
                db.session.rollback()
                logging.error(f"Analytics logging failed: {e}", exc_info=True)

            return result

        return wrapper

    return decorator
