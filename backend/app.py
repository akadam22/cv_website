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
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)  # Example: 30 minutes
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
    data = request.form
    name = data.get('name')
    contact = data.get('contact')
    location = data.get('location')
    email = data.get('email')
    password = data.get('password').encode('utf-8')
    role = data.get('role', 'recruiter')  # Default role is recruiter

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if the email already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user:
            return jsonify({"error": "Email already exists"}), 400

        hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

        # Insert new user into the database
        cursor.execute(
            "INSERT INTO users (name, contact, location, email, password_hash, created_at, updated_at, role) VALUES (%s, %s, %s, %s, %s, NOW(), NOW(), %s)",
            (name, contact, location, email, hashed_password, role)
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
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    password = password.encode('utf-8')

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM users WHERE name = %s", (username,))
        user = cursor.fetchone()

        if user and bcrypt.checkpw(password, user['password_hash'].encode('utf-8')):
            access_token = create_access_token(identity={'user_id': user['id'], 'username': user['name'], 'role': user['role']})
            refresh_token = create_refresh_token(identity={'user_id': user['id'], 'username': user['name'], 'role': user['role']})
            return jsonify({
                "message": "Login successful",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "username": user['name'],
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
    title = data.get('title')
    description = data.get('description')
    company = data.get('company')
    location = data.get('location')
    salary = data.get('salary')
    posted_by = current_user['user_id']  # Use 'user_id' from the token

    if not all([title, description, company, location, salary]):
        return jsonify({"error": "All fields are required"}), 422
    
    try:
        salary = int(salary)  # Convert salary to integer
        if salary <= 0:
            return jsonify({"error": "Salary must be greater than zero"}), 422
    except ValueError:
        return jsonify({"error": "Invalid salary format"}), 422

    conn = create_connection()
    cursor = conn.cursor()
    created_at = datetime.now()
    updated_at = created_at

    try:
        cursor.execute(
            "INSERT INTO job (title, description, company, location, salary, posted_by, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (title, description, company, location, salary, posted_by, created_at, updated_at)
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
        cursor.execute("SELECT * FROM job WHERE id = %s", (job_id,))
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

@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'recruiter':
        return jsonify({"error": "Access forbidden"}), 403

    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    company = data.get('company')
    location = data.get('location')
    salary = data.get('salary')
    updated_at = datetime.now()

    if not all([title, description, company, location, salary]):
        return jsonify({"error": "All fields are required"}), 422

    try:
        salary = int(salary)
        if salary <= 0:
            return jsonify({"error": "Salary must be greater than zero"}), 422
    except ValueError:
        return jsonify({"error": "Invalid salary format"}), 422

    conn = create_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "UPDATE job SET title = %s, description = %s, company = %s, location = %s, salary = %s, updated_at = %s WHERE id = %s",
            (title, description, company, location, salary, updated_at, job_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Job not found"}), 404
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
        cursor.execute("DELETE FROM job WHERE id = %s", (job_id,))
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
