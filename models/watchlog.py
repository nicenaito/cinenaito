from sqlalchemy import Column, Integer, String, Date, DateTime, func, create_engine
from flask_sqlalchemy import SQLAlchemy
from models.database import db
from models.user import User
from models.movie import Movie
from models.theater import Theater
    
class Watchlog(db.Model):
   __tablename__ = 'viewing_logs'
   log_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
   user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
   movie_id = db.Column(db.Integer, db.ForeignKey('movies.movie_id'), nullable=False)
   theater_id = db.Column(db.String(30), db.ForeignKey('theaters.theater_id'), nullable=False)
   viewed_date = db.Column(db.Date, nullable=False)
   created_at = db.Column(db.DateTime, default=func.current_timestamp())
   updated_at = db.Column(db.DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
