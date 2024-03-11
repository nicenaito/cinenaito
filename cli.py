from flask import Flask
from models import db
from jobs import job


app = Flask(__name__)

app.config.from_object('config')

db.init_app(app)
# api.init_app(app)

app.cli.add_command(job)