from datetime import datetime
import enum
from flask_sqlalchemy import SQLAlchemy
from core import db
import random 
from collections import defaultdict, deque



class Role(enum.Enum):
    Admin='admin'
    User='client'
    
class User(db.Model):
    __tablename__ = "users"
    
    id=db.Column(db.Integer,primary_key=True ,autoincrement=True)
    email=db.Column(db.String(120),unique=True,nullable=False)
    password=db.Column(db.String(256),nullable=False)
    role=db.Column(db.String(50),nullable=False,default=Role.User)
    created_at=db.Column(db.DateTime,default=datetime.utcnow)
    last_login=db.Column(db.DateTime,default=datetime.utcnow,onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<User {self.email}>'

class Topic(db.Model):
    __tablename__ = "topic"
    
    topic_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    parent_topic = db.Column(db.Integer, db.ForeignKey("topic.topic_id"), nullable=True)
    
    # Relationships
    parent = db.relationship("Topic", remote_side=[topic_id], backref="subtopics")
    questions = db.relationship("Question", back_populates="topic")  # ✅ plural, lowercase
    
    def __repr__(self):
        return f'<Topic {self.name}>'

class Question(db.Model):
    __tablename__ = "question"

    question_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    content = db.Column(db.Text, nullable=False)

    image_data = db.Column(db.LargeBinary, nullable=True)
    mimetype = db.Column(db.String(50), nullable=True)

    topic_id = db.Column(db.Integer, db.ForeignKey("topic.topic_id", ondelete="CASCADE"))
    correct_answer_id = db.Column(
        db.Integer,
        db.ForeignKey("answer_option.answer_id", ondelete="SET NULL"),
        nullable=True
    )

    # Relationships
    topic = db.relationship("Topic", back_populates="questions")

    answer_options = db.relationship(
        "AnswerOption",
        back_populates="question",
        cascade="all, delete-orphan",
        passive_deletes=True,
        foreign_keys="[AnswerOption.question_id]"   # ✅ tell SQLAlchemy which FK to use
    )

    correct_answer = db.relationship(
        "AnswerOption",
        foreign_keys=[correct_answer_id],
        post_update=True
    )

    def __repr__(self):
        return f"<Question {self.question_id}>"


class AnswerOption(db.Model):
    __tablename__ = "answer_option"

    answer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    question_id = db.Column(
        db.Integer,
        db.ForeignKey("question.question_id", ondelete="CASCADE"),
        nullable=False
    )
    option_text = db.Column(db.Text, nullable=False)

    # Relationships
    question = db.relationship(
        "Question",
        back_populates="answer_options",
        foreign_keys=[question_id]   # ✅ explicitly tie to question_id
    )

    def __repr__(self):
        return f"<AnswerOption {self.answer_id}>"
   
class Quiz(db.Model):
    __tablename__ = "quiz" 
    quiz_id = db.Column(db.Integer, primary_key=True, autoincrement=True) 
    title = db.Column(db.String(255)) 
    description = db.Column(db.Text) 
    publish_date = db.Column(db.DateTime, default=datetime.utcnow) 
    
    # Relationships 
    questions = db.relationship("QuizQuestion", back_populates="quiz") 
    
    def __repr__(self): return f"<Quiz {self.title}>" 
    
class QuizQuestion(db.Model): 
    __tablename__ = "quiz_question" 
    quiz_id = db.Column(db.Integer, db.ForeignKey("quiz.quiz_id"), primary_key=True) 
    question_id = db.Column(db.Integer, db.ForeignKey("question.question_id"), primary_key=True) 
    
    # Relationships 
    quiz = db.relationship("Quiz", back_populates="questions") 
    question = db.relationship("Question") 
    
    def __repr__(self): 
        return f"<QuizQuestion quiz={self.quiz_id}, question={self.question_id}>"



class Section(db.Model):
    __tablename__ = "sections"

    section_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    topic_id = db.Column(db.Integer, db.ForeignKey("topic.topic_id"), nullable=False)

    title = db.Column(db.String(255), nullable=False)
 
    order_index = db.Column(db.Integer, default=0)
    is_locked = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=db.func.now())

    # Relationships
    topic = db.relationship("Topic", backref="sections")
    components = db.relationship("Component", back_populates="section", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Section {self.title}>"


class Component(db.Model):
    __tablename__ = "components"

    component_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    section_id = db.Column(db.Integer, db.ForeignKey("sections.section_id"), nullable=False)
    # Explicit type: "content", "quiz", "exercise"
    title = db.Column(db.String(255), nullable=False)
    component_type = db.Column(db.String(50), default="content")
    
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=db.func.now())

    # Relationships
    section = db.relationship("Section", back_populates="components")
    items = db.relationship("ComponentItem", back_populates="component", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Component {self.component_id} type={self.component_type} format={self.format_type}>"


class ComponentItem(db.Model):
    __tablename__ = "component_items"

    item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    component_id = db.Column(db.Integer, db.ForeignKey("components.component_id"), nullable=False)
     
     # Instead of FK → content_formats, use a simple string
    format_type = db.Column(db.String(50), default="content")
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=True)  # LONGTEXT equivalent
    
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=db.func.now())

    mimetype = db.Column(db.String(255), nullable=True)
    image_data = db.Column(db.LargeBinary, nullable=True)

    # Relationships
    component = db.relationship("Component", back_populates="items")

    def __repr__(self):
        return f"<ComponentItem {self.title}>"
