import logging
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from core.models import db, User
from core import jwt, jwt_blacklist
from datetime import timedelta


auth_bp = Blueprint("auth", __name__)


@jwt.unauthorized_loader
def handle_missing_token(reason):
    return jsonify({"status": False, "error": f"Missing or invalid token: {reason}"}), 401


@jwt.invalid_token_loader
def handle_invalid_token(reason):
    return jsonify({"status": False, "error": f"Invalid token: {reason}"}), 422


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"status": False, "message": "Invalid or missing JSON payload"}), 400
        email = payload.get("email", "").strip().lower()
        password = payload.get("password")
        if not email or not password:
            return jsonify({"status": False, "message": "Email and password are required"}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"status": False, "message": "A user with this email already exists"}), 409
        db.session.add(User(email=email, password=generate_password_hash(password), role="client"))
        db.session.commit()
        return jsonify({"status": True, "message": "Registration successful"}), 201
    
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"status": False, "message": "Unexpected error occurred"}), 500


@auth_bp.route("/login", methods=["POST"])
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
        if not user or not check_password_hash(user.password, password):
            logging.warning(f"Login failed for email: {email}")
            return jsonify({"status": False, "message": "Invalid credentials"}), 401
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"email": user.email, "role": user.role}
        )
        return jsonify({"status": True, "token": access_token, "role": user.role}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({"status": False, "message": "Database error occurred"}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"status": False, "message": "Unexpected error occurred"}), 500


@auth_bp.route("/logout", methods=["GET"])
@jwt_required()
def logout():
    try:
        jti = get_jwt()["jti"]
        jwt_blacklist.add(jti)
        return jsonify({"status": True, "message": "Successfully logged out"}), 200
    except Exception as e:
        logging.error(f"Logout error: {str(e)}")
        return jsonify({"status": False, "message": "Logout failed"}), 500


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
def get_all_users():
    from core.utils.decorators import role_required
    try:
        users = User.query.filter(User.role == "client").all()
        response = [{"id": u.id, "email": u.email, "role": u.role} for u in users]
        return jsonify({"status": True, "users": response}), 200
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