import os
import logging
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from redis import Redis
from redis.exceptions import RedisError, ConnectionError
from core.config import Config

abstract_app = Flask(__name__)

abstract_app.config.from_object(Config)
abstract_app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
CORS(abstract_app, supports_credentials=True, origins=allowed_origins)

db = SQLAlchemy(abstract_app)
migrate = Migrate(abstract_app, db)
jwt = JWTManager(abstract_app)

jwt_blacklist = set()

try:
    redis_client = Redis.from_url(abstract_app.config['REDIS_URL'], decode_responses=True)
    redis_client.ping()
    redis_enabled = True
    logging.info("Redis connection successful")
except (ConnectionError, RedisError) as e:
    logging.warning(f"Redis connection failed: {e}. Falling back to in-memory blacklist.")
    redis_client = None
    redis_enabled = False

def blacklist_token(jti, expires_in):
    """Add token to blacklist with TTL equal to token expiration."""
    try:
        if redis_enabled and redis_client:
            redis_client.setex(f"blacklist:{jti}", expires_in, "1")
        else:
            jwt_blacklist.add(jti)
            logging.debug(f"Token {jti} added to in-memory blacklist (Redis unavailable)")
    except RedisError as e:
        logging.warning(f"Failed to blacklist token in Redis: {e}. Using in-memory fallback.")
        jwt_blacklist.add(jti)

def is_token_blacklisted(jti):
    """Check if token is in blacklist."""
    try:
        if redis_enabled and redis_client:
            return redis_client.exists(f"blacklist:{jti}") > 0
    except RedisError as e:
        logging.warning(f"Redis check failed: {e}. Checking in-memory blacklist.")
    return jti in jwt_blacklist

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return is_token_blacklisted(jti)

from core.routes import register_blueprints

register_blueprints(abstract_app)