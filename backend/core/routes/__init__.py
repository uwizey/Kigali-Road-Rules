from .auth import auth_bp
from .topics import topics_bp
from .questions import questions_bp
from .quizzes import quizzes_bp
from .sections import sections_bp
from .components import components_bp
from .subscription import subscription_bp


def register_blueprints(app):
    """Register all route blueprints with the Flask app."""
    app.register_blueprint(auth_bp)
    app.register_blueprint(topics_bp)
    app.register_blueprint(questions_bp)
    app.register_blueprint(quizzes_bp)
    app.register_blueprint(sections_bp)
    app.register_blueprint(components_bp)
    app.register_blueprint(subscription_bp)