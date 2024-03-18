# from flask_login import UserMixin, login_user
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required
# from app import login_manager
from models.database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(16), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(256))
    prefecture = db.Column(db.String(50))

    def __repr__(self):
        return f'<User {self.username}>'
        
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        return self.password_hash

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    