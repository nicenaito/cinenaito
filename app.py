from flask import Flask, jsonify, request, make_response
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from models.database import db, init_db
import models.movie
import theatrelist
# import requests


def jsonify_utf8(*args, **kwargs):
    response = make_response(jsonify(*args, **kwargs))
    response.mimetype = 'application/json; charset=utf-8'
    return response

app = Flask(__name__)
app.config.from_object('config')

init_db(app)
migrate = Migrate(app, db)

@app.route('/')
def hello():
    return 'Hello, Flask!'

@app.route('/api/v1/theaters', methods=['GET'])
def get_nearby_theaters():
    # 緯度と経度を取得
    latitude = request.args.get('latitude')
    longitude = request.args.get('longitude')

    # 緯度と経度が指定されていない場合はバッドリクエスト
    if not latitude or not longitude:
        return jsonify({'error': 'latitude and longitude are required'}), 400
    
    nearby_theaters = theatrelist.get_nearby_movie_theaters(latitude, longitude)

    return nearby_theaters

@app.route('/movielog', methods=['POST'])
def movielog():
    return "Log the movie!"

if __name__ == '__main__':
    # app.run()
    app.run(host='127.0.0.1', debug=True)