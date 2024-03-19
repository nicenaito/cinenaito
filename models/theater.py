
from sqlalchemy import Column, Integer, String, Date, DateTime, func, create_engine
from flask_sqlalchemy import SQLAlchemy
from models.database import db
    
class Theater(db.Model):
   __tablename__ = 'theaters'
   theater_id = db.Column(db.String(30), primary_key=True)
   theater_name = db.Column(db.String(255), nullable=False)
   theater_address = db.Column(db.String(200), nullable=False)
   latitude = db.Column(db.DECIMAL(9, 6), nullable=False)
   longitude = db.Column(db.DECIMAL(10, 6), nullable=False)
   created_at = db.Column(db.DateTime, default=func.current_timestamp())
   updated_at = db.Column(db.DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
