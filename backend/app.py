from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hellow, World!!!</p>"

@app.route('/useradd', method=['POST'])
def useradd():
    name = request.json['name']
    email = request.json['email']

    return jsonify({"success" : "Success Post"})