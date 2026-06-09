import logging
import time
from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from core.utils.decorators import APIResponse, role_required, track_event, rate_limit
from core.routes.subscription import give_free_package
from core.models import db, User
from core import jwt, blacklist_token
from datetime import timedelta, datetime

auth_bp = Blueprint("auth", __name__)


@jwt.unauthorized_loader
def handle_missing_token(reason):
    return APIResponse.unauthorized(f"Missing or invalid token: {reason}")


@jwt.invalid_token_loader
def handle_invalid_token(reason):
    print(f"Invalid token: {reason}")
    return APIResponse.error(f"Invalid token: {reason}", status_code=422)


# ─── Routes with @track_event (must return plain dicts) ──────────────────────


@auth_bp.route("/register", methods=["POST"])
@track_event("register_attempt")
def register():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return {
                "status": "error",
                "message": "Invalid or missing JSON payload",
                "_event_type": "register_failed",
                "_event_metadata": {"reason": "invalid_payload"},
            }, 400

        email = payload.get("email", "").strip().lower()
        password = payload.get("password")

        if not email or not password:
            return {
                "status": "error",
                "message": "Email and password are required",
                "_event_type": "register_failed",
                "_event_metadata": {"reason": "missing_fields"},
            }, 400

        if len(password) < 8:
            return {
                "status": "error",
                "message": "Password must be at least 8 characters",
                "_event_type": "register_failed",
                "_event_metadata": {"reason": "weak_password"},
            }, 400

        if User.query.filter_by(email=email).first():
            return {
                "status": "error",
                "message": "A user with this email already exists",
                "_event_type": "register_failed",
                "_event_metadata": {"reason": "duplicate_email", "email": email},
            }, 409

        db.session.add(
            User(email=email, password=generate_password_hash(password), role="client")
        )
        db.session.commit()

        new_user = User.query.filter_by(email=email).first()
        sub = give_free_package(new_user.id)
        print(f"🎉 New user registered: {email} (ID: {new_user})")
        if sub:
            print(f"✅ Free subscription {sub.id} created for user {user.id}")

        return {
            "status": "success",
            "message": "Registration successful with free package",
            "_event_type": "register_success",
            "_event_metadata": {
                "email": email,
                "subscription_id": sub.id if sub else None,
            },
        }, 201

        return {
            "status": "success",
            "message": "Registration successful",
            "_event_type": "register_success",
            "_event_metadata": {"email": email},
        }, 201

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return {
            "status": "error",
            "message": "Database error occurred",
            "_event_type": "register_error",
            "_event_metadata": {"error": str(e)},
        }, 500

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return {
            "status": "error",
            "message": "Unexpected error occurred",
            "_event_type": "register_error",
            "_event_metadata": {"error": str(e)},
        }, 500


@auth_bp.route("/login", methods=["POST"])
@track_event("login_attempt")
def login():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return {
                "status": "error",
                "message": "Invalid or missing JSON payload",
            }, 400

        email = payload.get("email", "").strip().lower()
        password = payload.get("password")

        if not email or not password:
            return {
                "status": "error",
                "message": "Email and password are required",
            }, 400

        user = User.query.filter_by(email=email).first()

        if not user or not check_password_hash(user.password, password):
            logging.warning(f"Login failed for email: {email}")
            return {"status": "error", "message": "Invalid credentials"}, 401

        if not user.is_active:
            return {
                "status": "error",
                "message": "Your account has been deactivated",
            }, 403

        previous_login = user.last_login.isoformat() if user.last_login else None
        user.last_login = datetime.utcnow()
        db.session.commit()

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"email": user.email, "role": user.role},
        )

        return {
            "status": "success",
            "message": "Login successful",
            "data": {
                "token": access_token,
                "role": user.role,
                "last_login": previous_login,
            },
            "_event_type": "login_success",
            "_event_metadata": {"email": email},
        }, 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return {"status": "error", "message": "Database error occurred"}, 500

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return {"status": "error", "message": "Unexpected error occurred"}, 500


@auth_bp.route("/logout", methods=["GET"])
@jwt_required()
@track_event("logout_attempt")
def logout():
    try:
        jwt_payload = get_jwt()
        jti = jwt_payload["jti"]
        exp = jwt_payload.get("exp")

        expires_in = max(0, int(exp - time.time())) if exp else 3600
        blacklist_token(jti, expires_in)

        return {
            "status": "success",
            "message": "Successfully logged out",
            "_event_type": "logout_success",
            "_event_metadata": {"logout": "success"},
        }, 200

    except Exception as e:
        logging.error(f"Logout error: {str(e)}")
        return {
            "status": "error",
            "message": "Logout failed",
            "_event_type": "logout_failed",
            "_event_metadata": {"error": str(e)},
        }, 500


# ─── Standard routes (use APIResponse) ───────────────────────────────────────


@auth_bp.route("/user/profile", methods=["GET"])
@jwt_required()
def profile():
    claims = get_jwt()
    return APIResponse.success(data={"email": claims["email"], "role": claims["role"]})


@auth_bp.route("/user/update-email", methods=["PUT"])
@jwt_required()
def update_email():
    try:
        data = request.get_json()
        current_password = data.get("current_password")
        new_email = data.get("new_email")

        if not current_password or not new_email:
            return APIResponse.bad_request("Missing required fields")

        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return APIResponse.not_found("User not found")

        if not check_password_hash(user.password, current_password):
            return APIResponse.forbidden("Invalid current password")

        if User.query.filter_by(email=new_email).first():
            return APIResponse.conflict("Email already in use")

        user.email = new_email
        db.session.commit()

        new_token = create_access_token(
            identity=str(user.id),
            additional_claims={"email": user.email, "role": user.role},
            expires_delta=timedelta(hours=1),
        )

        return APIResponse.success(
            data={"access_token": new_token}, message="Email updated successfully"
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating email: {e}")
        return APIResponse.server_error()


@auth_bp.route("/user/update-password", methods=["PUT"])
@jwt_required()
def update_password():
    try:
        data = request.get_json()
        old_password = data.get("current_password")
        new_password = data.get("new_password")

        if not old_password or not new_password:
            return APIResponse.bad_request("Missing required fields")

        if len(new_password) < 8:
            return APIResponse.bad_request("Password must be at least 8 characters")

        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return APIResponse.not_found("User not found")

        if not check_password_hash(user.password, old_password):
            return APIResponse.forbidden("Invalid current password")

        user.password = generate_password_hash(new_password)
        db.session.commit()

        new_token = create_access_token(
            identity=str(user.id),
            additional_claims={"email": user.email, "role": user.role},
            expires_delta=timedelta(hours=1),
        )

        return APIResponse.success(
            data={"access_token": new_token}, message="Password updated successfully"
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating password: {e}")
        return APIResponse.server_error()


@auth_bp.route("/users", methods=["GET"])
@role_required(["admin"])
def get_all_users():
    try:
        users = User.query.filter(User.role == "client").all()

        data = [
            {
                "id": u.id,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "last_login": u.last_login.isoformat() if u.last_login else None,
                "deleted_at": u.deleted_at.isoformat() if u.deleted_at else None,
            }
            for u in users
        ]

        return APIResponse.success(data=data, meta={"count": len(data)})

    except Exception as e:
        logging.error(f"Error retrieving users: {str(e)}")
        return APIResponse.server_error("Error retrieving users")


@auth_bp.route("/user/<int:user_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin"])
def delete_user(user_id):
    try:
        admin_id = get_jwt_identity()
        if admin_id == user_id:
            return APIResponse.forbidden(
                "Admins cannot delete their own account using this route"
            )

        user = User.query.get(user_id)
        if not user:
            return APIResponse.not_found("User not found")

        db.session.delete(user)
        db.session.commit()
        return APIResponse.success(message="User deleted successfully")

    except Exception as e:
        logging.error(f"Error deleting user: {str(e)}")
        return APIResponse.server_error("Error deleting user")


@auth_bp.route("/user/<int:user_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin"])
def update_user(user_id):
    try:
        admin_id = get_jwt_identity()
        if admin_id == user_id:
            return APIResponse.forbidden(
                "Admins cannot update their own account using this route"
            )

        payload = request.get_json(force=True, silent=True)
        if not payload:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        user = User.query.get(user_id)
        if not user:
            return APIResponse.not_found("User not found")

        email = payload.get("email", "").strip().lower()
        password = payload.get("password")

        if email:
            if User.query.filter_by(email=email).first():
                return APIResponse.conflict("Email already in use")
            user.email = email

        if password:
            if len(password) < 8:
                return APIResponse.bad_request("Password must be at least 8 characters")
            user.password = generate_password_hash(password)

        db.session.commit()
        return APIResponse.success(message="User updated successfully")

    except Exception as e:
        logging.error(f"Error updating user: {str(e)}")
        return APIResponse.server_error("Error updating user")


@auth_bp.route("/user/email", methods=["GET"])
@jwt_required()
def get_user_email():
    try:
        claims = get_jwt()
        return APIResponse.success(data={"email": claims["email"]})
    except Exception as e:
        logging.error(f"Error retrieving user email: {str(e)}")
        return APIResponse.server_error("Error retrieving user email")


@auth_bp.route("/admin/reset-password", methods=["PUT"])
@role_required(["admin"])
def admin_reset_password():
    try:
        data = request.get_json()
        if not data:
            return APIResponse.bad_request("Invalid or missing JSON payload")

        user_id = data.get("id")
        new_password = data.get("password")

        if not user_id or not new_password:
            return APIResponse.bad_request("User ID and new password are required")

        if len(new_password) < 8:
            return APIResponse.bad_request("Password must be at least 8 characters")

        user = User.query.get(user_id)
        if not user:
            return APIResponse.not_found("User not found")

        admin_id = get_jwt_identity()
        if admin_id == user_id:
            return APIResponse.forbidden(
                "Admins cannot reset their own password using this route"
            )

        user.password = generate_password_hash(new_password)
        db.session.commit()
        return APIResponse.success(message="Password has been updated successfully")

    except Exception as e:
        logging.error(f"Admin password reset error: {e}")
        db.session.rollback()
        return APIResponse.server_error("Server error while resetting password")


@auth_bp.route("/admin/deactivate-user/<int:user_id>", methods=["PUT"])
@role_required(["admin"])
def deactivate_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return APIResponse.not_found("User not found")

        if not user.is_active:
            return APIResponse.bad_request("User already deactivated")

        admin_id = get_jwt_identity()
        if admin_id == user_id:
            return APIResponse.forbidden("You cannot deactivate your own account")

        user.is_active = False
        user.deleted_at = datetime.utcnow()
        db.session.commit()

        return APIResponse.success(
            data={"deleted_at": user.deleted_at.isoformat()},
            message="User deactivated successfully",
        )

    except Exception as e:
        logging.error(f"Error deactivating user {user_id}: {e}")
        db.session.rollback()
        return APIResponse.server_error("Server error while deactivating user")


@auth_bp.route("/admin/activate-user/<int:user_id>", methods=["PUT"])
@role_required(["admin"])
def activate_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return APIResponse.not_found("User not found")

        if user.is_active:
            return APIResponse.bad_request("User is already active")

        admin_id = get_jwt_identity()
        if admin_id == user_id:
            return APIResponse.forbidden(
                "You cannot activate your own account using this route"
            )

        user.is_active = True
        user.deleted_at = None
        db.session.commit()
        return APIResponse.success(message="User activated successfully")

    except Exception as e:
        logging.error(f"Error activating user {user_id}: {e}")
        db.session.rollback()
        return APIResponse.server_error("Server error while activating user")
