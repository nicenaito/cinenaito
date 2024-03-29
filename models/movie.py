from sqlalchemy import Column, Integer, String, Date, DateTime, func, create_engine
# from sqlalchemy.orm import sessionmaker
from flask_sqlalchemy import SQLAlchemy
from models.database import db

class Movie(db.Model):
    __tablename__ = 'movies'

    movie_id = db.Column(db.Integer, primary_key=True)
    movie_title = db.Column(db.String(255), nullable=False)
    release_date = db.Column(db.Date, nullable=False)
    poster_filepath = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, nullable=False, default=func.current_timestamp())
    updated_at = db.Column(db.DateTime, nullable=False, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    @classmethod
    def add_movie(cls, id, title, release_date, poster_filepath):
        """
        映画情報を登録する
        :param id:
        :param title:
        :param release_date:
        :param director:
        :param genre:
        :poster_filepath:
        :return: Movie
        """
        obj = cls(movie_id=id, movie_title=title, release_date=release_date, poster_filepath=poster_filepath)
        db.session.merge(obj)
        return obj