from flask import Flask, request, jsonify
from app import app, db
from werkzeug.security import generate_password_hash, check_password_hash

VALID_ROLES = {'admin', 'user', 'guest'}

# Initialize the Flask application
app = Flask(__name__)


@app.route('/api/registerform', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'recruiter')  # Default role is 'recruiter' if not provided

    # Validate role
    if role not in VALID_ROLES:
        return jsonify(error="Invalid role"), 400

    # Check if username or email already exists
    try:
        existing_user = db.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email)).fetchone()
        if existing_user:
            return jsonify(error="Username or email already exists"), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Insert user into the database
        db.execute("INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)", (username, email, hashed_password, role))
        db.commit()
        return jsonify(message="User registered successfully"), 201

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")  # Print the error to the console for debugging
        return jsonify(error=f"An error occurred while registering user. Details: {e}"), 500

@app.route('/api/signin', methods=['POST'])
def sign_in():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Query the database to find user with matching username
    user = db.execute("SELECT * FROM users WHERE username = %s", (username,)).fetchone()

    if user and check_password_hash(user['password'], password):
        return jsonify(message="Sign in successful"), 200
    else:
        return jsonify(error="Invalid username or password"), 401
