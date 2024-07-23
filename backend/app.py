from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import os

app = Flask(__name__)
CORS(app)

# Database connection
def create_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "cv_website")
    )

# Register Route
@app.route('/api/registerform', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password'].encode('utf-8')
    role = data.get('role', 'recruiter') #there are recruiter, admin, user

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if username already exists
    cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username,email))
    user = cursor.fetchone()

    if user:
        cursor.close()
        conn.close()
        return jsonify({"error": "Username or email already exists"}), 400

    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
    cursor.execute(
        "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)",
        (username, email, hashed_password, role)
    )
    conn.commit()

    cursor.close()
    conn.close()
    return jsonify({"message": "User registered successfully"}), 201

# Login Route
@app.route('/api/signin', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password'].encode('utf-8')

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user and bcrypt.checkpw(password, user['password'].encode('utf-8')):
        return jsonify({
            "message": "Login successful",
            "username": user['username'],  # Include username in the response
            "role": user['role']
        }), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 400

if __name__ == '__main__':
    app.run(debug=True)
