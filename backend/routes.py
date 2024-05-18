# import os
# from flask import Flask, request, jsonify, url_for, Blueprint
# from api.models import db, User
# from api.utils import generate_sitemap, APIException
# from flask_jwt_extended import create_access_token
# from flask_jwt_extended import get_jwt_identity
# from flask_jwt_extended import jwt_required

# api = Blueprint('api', __name__)

# @api.route('/token', methods=['POST'])
# def create_token():
#     email = request.json.get("email", None)
#     password = request.json.get("password", None)
#     if email != "test" or password != "test":
#         return jsonify({"msg": "Bad Username or Password"}) , 401
    
#     access_token = create_access_token(identity=email)
#     return jsonify(access_token = access_token)

from flask import Blueprint, jsonify

# Create a Blueprint object to define routes
api = Blueprint('api', __name__)

# Define API endpoints
@api.route('/api/hello')
def hello():
    return jsonify(message='Hello, World!')

@api.route('/api/users')
def get_users():
    # Your logic to fetch users from the database
    users = [{'username': 'john_doe', 'email': 'john@example.com'}]
    return jsonify(users=users)

# Add more routes as needed

# Example of a route with dynamic parameter
@api.route('/api/users/<int:user_id>')
def get_user(user_id):
    # Your logic to fetch user with user_id from the database
    user = {'id': user_id, 'username': 'example_user'}
    return jsonify(user=user)

# Define other routes and endpoints for your application
