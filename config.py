import os

DEBUG = True
JSON_AS_ASCII = False

SQLALCHEMY_TRACK_MODIFICATIONS = True
SQLALCHEMY_ECHO = True
SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://{user}:{password}@{host}/{name}'.format(**{
    'user': 'cinenaito',
    'password': 'cinenaito+',
    'host': '127.0.0.1',
    'name': 'cinenaito'
})

SECRET_KEY = os.environ.get('SECRET_KEY')