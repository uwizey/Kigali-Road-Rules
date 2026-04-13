import logging

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from core.models import db, User
from core import jwt, jwt_blacklist
from datetime import timedelta,datetime
from core.utils.decorators import role_required, track_event,rate_limit


auth_bp = Blueprint("auth", __name__)


@jwt.unauthorized_loader
def handle_missing_token(reason):
    return jsonify({"status": False, "error": f"Missing or invalid token: {reason}"}), 401


@jwt.invalid_token_loader
def handle_invalid_token(reason):
    return jsonify({"status": False, "error": f"Invalid token: {reason}"}), 422


@auth_bp.route("/register", methods=["POST"])
@track_event("register_attempt")   # 👈 added decorator
def register():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return {
                "status": False,
                "message": "Invalid or missing JSON payload",
                "_event_type": "register_failed",
                "_event_metadata": {"reason": "invalid_payload"}
            }, 400

        email = payload.get("email", "").strip().lower()
        password = payload.get("password")

        if not email or not password:
            return {
                "status": False,
                "message": "Email and password are required",
                "_event_type": "register_failed",
                "_event_metadata": {"reason": "missing_fields"}
            }, 400

        if User.query.filter_by(email=email).first():
            return {
                "status": False,
                "message": "A user with this email already exists",
                "_event_type": "register_failed",
                "_event_metadata": {"reason": "duplicate_email", "email": email}
            }, 409

        # Create new user
        db.session.add(User(
            email=email,
            password=generate_password_hash(password),
            role="client"
        ))
        db.session.commit()

        return {
            "status": True,
            "message": "Registration successful",
            "_event_type": "register_success",
            "_event_metadata": {"email": email}
        }, 201

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return {
            "status": False,
            "message": "Database error occurred",
            "_event_type": "register_error",
            "_event_metadata": {"error": str(e)}
        }, 500

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return {
            "status": False,
            "message": "Unexpected error occurred",
            "_event_type": "register_error",
            "_event_metadata": {"error": str(e)}
        }, 500


@auth_bp.route("/login", methods=["POST"])
@track_event("login_attempt")  # default event type
def login():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400

        email = payload.get("email", "").strip().lower()
        password = payload.get("password")

        if not email or not password:
            return jsonify({"status": False, "message": "Email and password are required"}), 400

        user = User.query.filter_by(email=email).first()

        # Invalid credentials
        if not user or not check_password_hash(user.password, password):
            logging.warning(f"Login failed for email: {email}")
            return jsonify({"status": False, "message": "Invalid credentials"}), 401

        # ❌ Soft-deleted or deactivated user
        if not user.is_active:
            return jsonify({"status": False, "message": "Your account has been deactivated"}), 403

        # Store previous login time before updating
        previous_login = user.last_login.isoformat() if user.last_login else None

        # Update last login timestamp
        user.last_login = datetime.utcnow()
        db.session.commit()

        # Create JWT
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"email": user.email, "role": user.role}
        )

        return jsonify({
            "status": True,
            "token": access_token,
            "role": user.role,
            "last_login": previous_login
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"status": False, "message": "Unexpected error occurred"}), 500



@auth_bp.route("/logout", methods=["GET"])
@jwt_required()
@track_event("logout_attempt")  # <-- added here
def logout():
    try:
        jti = get_jwt()["jti"]
        jwt_blacklist.add(jti)

        # You can also pass extra metadata back to the decorator if needed
        return {
            "status": True,
            "message": "Successfully logged out",
            "_event_type": "logout_success",  # overrides default event type
            "_event_metadata": {"logout": "success"},
        }, 200

    except Exception as e:
        logging.error(f"Logout error: {str(e)}")
        return {
            "status": False,
            "message": "Logout failed",
            "_event_type": "logout_failed",  # log failure event
            "_event_metadata": {"error": str(e)},
        }, 500


@auth_bp.route("/user/profile", methods=["GET"])
@jwt_required()
def profile():
    get_jwt_identity()
    claims = get_jwt()
    return jsonify({"status": True, "data": {"email": claims["email"], "role": claims["role"]}}), 200


@auth_bp.route("/user/update-email", methods=["PUT"])
@jwt_required()
def update_email():
    try:
        data = request.get_json()
        current_password = data.get("current_password")
        new_email = data.get("new_email")

        if not current_password or not new_email:
            return jsonify({"status": False, "message": "Missing required fields"}), 400

        # ✅ Identify user from JWT
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({"status": False, "message": "User not found"}), 404

        # ✅ Verify current password
        if not check_password_hash(user.password, current_password):
            return jsonify({"status": False, "message": "Invalid current password"}), 403

        # ✅ Ensure new email is unique
        if User.query.filter_by(email=new_email).first():
            return jsonify({"status": False, "message": "Email already in use"}), 409

        # ✅ Update email
        user.email = new_email
        db.session.commit()

        # ✅ Refresh JWT with new claims
        additional_claims = {"email": user.email, "role": user.role}
        new_token = create_access_token(
            identity=user.id,   # <-- FIXED HERE
            additional_claims=additional_claims,
            expires_delta=timedelta(hours=1)
        )

        return jsonify({
            "status": True,
            "message": "Email updated successfully",
            "access_token": new_token
        }), 200

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating email: {e}")
        return jsonify({"status": False, "message": "Server error"}), 500


@auth_bp.route("/user/update-password", methods=["PUT"])
@jwt_required()
def update_password():
    try:
        data = request.get_json()
        old_password = data.get("current_password")
        new_password = data.get("new_password")

        if not old_password or not new_password:
            return jsonify({"status": False, "message": "Missing required fields"}), 400

        # ✅ Identify user from JWT
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({"status": False, "message": "User not found"}), 404

        # ✅ Verify old password
        if not check_password_hash(user.password, old_password):
            return jsonify({"status": False, "message": "Invalid current password"}), 403

        # ✅ Update password (hash new one)
        user.password = generate_password_hash(new_password)
        db.session.commit()

        # ✅ Refresh JWT with updated claims
        additional_claims = {"email": user.email, "role": user.role}
        new_token = create_access_token(
            identity=user.id,   # use your actual PK field
            additional_claims=additional_claims,
            expires_delta=timedelta(hours=1)
        )

        return jsonify({
            "status": True,
            "message": "Password updated successfully",
            "access_token": new_token
        }), 200

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating password: {e}")
        return jsonify({"status": False, "message": "Server error"}), 500


@auth_bp.route("/users", methods=["GET"])
@role_required(["admin"])
def get_all_users():
    try:
        users = User.query.filter(User.role == "client").all()

        response = []
        for u in users:
            response.append({
                "id": u.id,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "last_login": u.last_login.isoformat() if u.last_login else None,
                "deleted_at": u.deleted_at.isoformat() if u.deleted_at else None
            })

        return jsonify({
            "status": True,
            "users": response,
            "count": len(response)
        }), 200

    except Exception as e:
        logging.error(f"Error retrieving users: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving users"}), 500

@auth_bp.route("/user/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    from core.utils.decorators import role_required
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"status": False, "message": "User not found"}), 404
        db.session.delete(user)
        db.session.commit()
        return jsonify({"status": True, "message": "User deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting user: {str(e)}")
        return jsonify({"status": False, "message": "Error deleting user"}), 500

@auth_bp.route("/user/<int:user_id>", methods=["PUT"])
def update_user(user_id):   
    from core.utils.decorators import role_required
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400
        user = User.query.get(user_id)
        if not user:
            return jsonify({"status": False, "message": "User not found"}), 404
        email = payload.get("email", "").strip().lower()
        password = payload.get("password")
        if email:
            user.email = email
        if password:
            user.password = generate_password_hash(password)
        db.session.commit()
        return jsonify({"status": True, "message": "User updated successfully"}), 200
    except Exception as e:
        logging.error(f"Error updating user: {str(e)}")
        return jsonify({"status": False, "message": "Error updating user"}), 500


@auth_bp.route("/user/email", methods=["GET"])
@jwt_required()
def get_user_email():
    try:
        claims = get_jwt()
        return jsonify({"status": True, "email": claims["email"]}), 200
    except Exception as e:
        logging.error(f"Error retrieving user email: {str(e)}")
        return jsonify({"status": False, "message": "Error retrieving user email"}), 500


@auth_bp.route("/admin/reset-password", methods=["PUT"])
@role_required(["admin"])   # Only admins can use this
def admin_reset_password():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400

        user_id = data.get("id")
        new_password = data.get("password")

        if not user_id or not new_password:
            return jsonify({"status": False, "message": "User ID and new password are required"}), 400

        # Fetch user
        user = User.query.get(user_id)
        if not user:
            return jsonify({"status": False, "message": f"User with ID {user_id} not found"}), 404

        # Prevent admin from using this endpoint on themselves
        admin_id = get_jwt_identity()
        if admin_id == user_id:
            return jsonify({"status": False, "message": "Admins cannot reset their own password using this route"}), 403

        # Hash and update password
        user.password = generate_password_hash(new_password)
        db.session.commit()

        return jsonify({
            "status": True,
            "message": f"Password for user {user_id} has been updated successfully"
        }), 200

    except Exception as e:
        logging.error(f"Admin password reset error: {e}")
        db.session.rollback()
        return jsonify({"status": False, "message": "Server error while resetting password"}), 500


@auth_bp.route("/admin/deactivate-user/<int:user_id>", methods=["PUT"])
@role_required(["admin"])
def deactivate_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"status": False, "message": f"User {user_id} not found"}), 404

        if not user.is_active:
            return jsonify({"status": False, "message": "User already deactivated"}), 400

        # Prevent admin from deactivating themselves
        admin_id = get_jwt_identity()
        if admin_id == user_id:
            return jsonify({"status": False, "message": "You cannot deactivate your own account"}), 403

        user.is_active = False
        user.deleted_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "status": True,
            "message": f"User {user_id} deactivated successfully",
            "deleted_at": user.deleted_at.isoformat()
        }), 200

    except Exception as e:
        logging.error(f"Error deactivating user {user_id}: {e}")
        db.session.rollback()
        return jsonify({"status": False, "message": "Server error while deactivating user"}), 500

@auth_bp.route("/admin/activate-user/<int:user_id>", methods=["PUT"])
@role_required(["admin"])
def activate_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"status": False, "message": f"User {user_id} not found"}), 404

        # Already active
        if user.is_active:
            return jsonify({"status": False, "message": "User is already active"}), 400

        # Optional: prevent admin from activating themselves through this route
        admin_id = get_jwt_identity()
        if admin_id == user_id:
            return jsonify({"status": False, "message": "You cannot activate your own account using this route"}), 403

        # Reactivate user
        user.is_active = True
        user.deleted_at = None
        db.session.commit()

        return jsonify({
            "status": True,
            "message": f"User {user_id} activated successfully"
        }), 200

    except Exception as e:
        logging.error(f"Error activating user {user_id}: {e}")
        db.session.rollback()
        return jsonify({"status": False, "message": "Server error while activating user"}), 500
