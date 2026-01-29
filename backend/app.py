from core import abstract_app, db
from core.models import User

app = abstract_app

if __name__ == "__main__":
    with app.app_context():
        db.create_all()   
    app.run(debug=True)
