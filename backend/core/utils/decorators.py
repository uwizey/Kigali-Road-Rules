from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


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