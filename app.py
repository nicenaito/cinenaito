from flask import Flask
from flask_migrate import Migrate
# import movie

app = Flask(__name__)
app.config.from_object('config')

@app.route('/')
def hello():
    return 'Hello, Flask!'

@app.route('/api')
def other1():
    return "API!API!"

if __name__ == '__main__':
    app.run()
