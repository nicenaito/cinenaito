
from sqlalchemy import Column, Integer, String, Date, DateTime, func, create_engine
from flask_sqlalchemy import SQLAlchemy
from models.database import db
    
class Theater(db.Model):
   __tablename__ = 'theaters'
   theater_id = db.Column(db.String(30), primary_key=True)
   theater_name = db.Column(db.String(255), nullable=False)
   created_at = db.Column(db.DateTime, default=func.current_timestamp())
   updated_at = db.Column(db.DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
