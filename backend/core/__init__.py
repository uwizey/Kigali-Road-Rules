from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from core.config import Config

abstract_app = Flask(__name__)

abstract_app.config.from_object(Config)
abstract_app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

CORS(abstract_app, supports_credentials=True, origins=["http://localhost:3000"])

db = SQLAlchemy(abstract_app)
migrate = Migrate(abstract_app, db)
jwt = JWTManager(abstract_app)

jwt_blacklist = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return jti in jwt_blacklist

from core.routes import register_blueprints

register_blueprints(abstract_app)  # ← was `app`, should be `abstract_app`