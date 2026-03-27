import logging
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from core.models import db, User
from core import jwt, jwt_blacklist

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