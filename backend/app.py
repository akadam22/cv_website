from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import mysql.connector
import bcrypt
import os

app = Flask(__name__)
CORS(app , resources={r"/api/*": {"origins": "*"}})

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
    role = data.get('role', 'recruiter')  # Default role is recruiter

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if username already exists
    cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
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

# Stats Route
@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    # Queries to get required data
    cursor.execute("SELECT COUNT(*) AS total_jobs FROM jobs")
    total_jobs = cursor.fetchone()['total_jobs']

    cursor.execute("SELECT COUNT(*) AS total_users FROM users")
    total_users = cursor.fetchone()['total_users']

    cursor.execute("SELECT COUNT(*) AS total_admins FROM users WHERE role = 'admin'")
    total_admins = cursor.fetchone()['total_admins']

    cursor.execute("SELECT COUNT(*) AS total_recruiters FROM users WHERE role = 'recruiter'")
    total_recruiters = cursor.fetchone()['total_recruiters']

    cursor.execute("SELECT COUNT(*) AS total_jobs_posted FROM jobs")
    total_jobs_posted = cursor.fetchone()['total_jobs_posted']

    cursor.close()
    conn.close()

    return jsonify({
        'total_jobs': total_jobs,
        'total_users': total_users,
        'total_admins': total_admins,
        'total_recruiters': total_recruiters,
        'total_jobs_posted': total_jobs_posted
    })

#get user details
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Fetch all users
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()

    cursor.close()
    conn.close()
    
    return jsonify(users)

# Update a user
@app.route('/api/users/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.get_json()
    username = data['username']
    email = data['email']
    role = data['role']

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "UPDATE users SET username = %s, email = %s, role = %s WHERE id = %s",
        (username, email, role, id)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "User updated successfully"})

# Delete a user
@app.route('/api/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("DELETE FROM users WHERE id = %s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "User deleted successfully"})

# Create a new job posting
@app.route('/api/jobs', methods=['POST'])
@jwt_required()
def create_job():
    current_user = get_jwt_identity()
    if current_user['role'] != 'recruiter':
        return jsonify({"error": "Access forbidden"}), 403

    data = request.get_json()
    title = data['title']
    description = data['description']
    company = data['company']
    location = data['location']
    salary = data['salary']

    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO jobs (title, description, company, location, salary) VALUES (%s, %s, %s, %s)",
        (title, description, company, location, salary)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Job posted successfully"}), 201

# Get list of jobs
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM jobs")
    jobs = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(jobs)

# Update a job posting
@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'recruiter':
        return jsonify({"error": "Access forbidden"}), 403

    data = request.get_json()
    title = data['title']
    description = data['description']
    company = data['company']
    location = data['location']
    salary = data['salary']

    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE jobs SET title = %s, description = %s, company = %s, location = %s, salary = %s WHERE id = %s",
        (title, description, company, location, salary, job_id)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Job updated successfully"}), 200

# Delete a job posting
@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'recruiter':
        return jsonify({"error": "Access forbidden"}), 403

    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM jobs WHERE id = %s", (job_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Job deleted successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
