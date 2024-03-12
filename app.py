from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from models.database import db, init_db
import models.movie

app = Flask(__name__)
app.config.from_object('config')

init_db(app)
migrate = Migrate(app, db)

@app.route('/')
def hello():
    return 'Hello, Flask!'

@app.route('/api')
def other1():
    return "API!API!"

if __name__ == '__main__':
    app.run()
