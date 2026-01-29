from flask import Flask
from core.config import Config
from flask_cors import CORS

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from core.config import Config
from flask_jwt_extended import JWTManager

abstract_app = Flask(__name__)
abstract_app.config.from_object(Config)

CORS(abstract_app, supports_credentials=True, origins=["http://localhost:3000"])

db = SQLAlchemy(abstract_app)
migrate = Migrate(abstract_app, db)
jwt =JWTManager(abstract_app)

jwt_blacklist = set()

@jwt.token_in_blocklist_loader 
def check_if_token_revoked(jwt_header, jwt_payload): 
    jti = jwt_payload["jti"] 
    return jti in jwt_blacklist

# Import routes so they register
import core.routes




