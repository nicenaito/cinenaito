from flask import Flask

app = Flask(__name__)
app.config.from_object('config')

@app.route('/')
def hello():
    return 'Hello, Flask!'

@app.route('/test')
def other1():
    return "テストページです！"

if __name__ == '__main__':
    app.run()
