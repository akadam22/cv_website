from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, create_refresh_token, get_jwt_identity
import mysql.connector
import bcrypt
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Change this to a random secret key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)  # Example: 15 minutes
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)  # Example: 30 days
jwt = JWTManager(app)

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

    try:
        cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
        user = cursor.fetchone()

        if user:
            return jsonify({"error": "Username or email already exists"}), 400

        hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
        cursor.execute(
            "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)",
            (username, email, hashed_password, role)
        )
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# Login Route
@app.route('/api/signin', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password'].encode('utf-8')

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user and bcrypt.checkpw(password, user['password'].encode('utf-8')):
            access_token = create_access_token(identity={'username': user['username'], 'role': user['role']})
            refresh_token = create_refresh_token(identity={'username': user['username'], 'role': user['role']})
            return jsonify({
                "message": "Login successful",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "username": user['username'],
                "role": user['role']
            }), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# Refresh Token Route
@app.route('/api/token/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify(access_token=new_access_token), 200

# Get user details
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        return jsonify(users)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

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
    post_date = datetime.now().strftime('%Y-%m-%d')  # Use date format for PostDate
    created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Timestamp format for CreatedAt

    try:
        cursor.execute(
            "INSERT INTO job (JobTitle, JobDescription, Company, Location, Salary, PostDate, CreatedAt) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (title, description, company, location, salary, post_date, created_at)
        )
        conn.commit()
        return jsonify({"message": "Job posted successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# Get list of jobs
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM job")
        jobs = cursor.fetchall()
        return jsonify(jobs)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# Get a specific job
@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM job WHERE JobID = %s", (job_id,))
        job = cursor.fetchone()
        if job:
            return jsonify(job)
        else:
            return jsonify({"error": "Job not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# Update job posting
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
    updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    try:
        cursor.execute(
            "UPDATE job SET JobTitle = %s, JobDescription = %s, Company = %s, Location = %s, Salary = %s, UpdatedAt = %s WHERE JobID = %s",
            (title, description, company, location, salary, updated_at, job_id)
        )
        conn.commit()
        return jsonify({"message": "Job updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# Delete a job posting
@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'recruiter':
        return jsonify({"error": "Access forbidden"}), 403

    conn = create_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM job WHERE JobID = %s", (job_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Job not found"}), 404
        return jsonify({"message": "Job deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
