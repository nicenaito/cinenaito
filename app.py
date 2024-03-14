from flask import Flask, jsonify, request, render_template
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from models.database import db, init_db
from models.user import User
from models.movie import Movie
from flask import flash, redirect, url_for
import theatrelist
from flask_login import current_user, login_required, login_user, LoginManager, logout_user
from forms import LoginForm

app = Flask(__name__)
app.config.from_object('config')

login_manager = LoginManager()
login_manager.init_app(app)

init_db(app)
migrate = Migrate(app, db)

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

@app.route('/')
def index():
    return render_template('index.html')

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

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('login'))
        login_user(user)
        return redirect(url_for('index'))
    return render_template('login.html', title='Sign In', form=form)

from forms import RegistrationForm

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('You are now a registered user!')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)

from forms import EditProfileForm

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
    form = EditProfileForm(current_user.username)
    if form.validate_on_submit():
        current_user.username = form.username.data
        current_user.email = form.email.data
        db.session.commit()
        flash('Your changes have been saved.')
        return redirect(url_for('profile'))
    elif request.method == 'GET':
        form.username.data = current_user.username
        form.email.data = current_user.email
    return render_template('profile.html', title='Edit Profile', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.')
    return redirect(url_for('index'))

if __name__ == '__main__':
    # app.run()
    app.run(host='127.0.0.1', debug=True)