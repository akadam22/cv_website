from email.mime.text import MIMEText
import smtplib
from flask import Flask, json, Blueprint, logging, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, create_refresh_token, get_jwt_identity
import mysql.connector
import bcrypt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from docx import Document 

# Load environment variables from .env
load_dotenv()
app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": "http://localhost:3000",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    },
    r"/send-email": {
        "origins": "http://localhost:3000",
        "methods": ["POST"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})
# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
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
# Example of proper cursor management
@app.route('/api/signin', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM users WHERE name = %s", (username,))
        user = cursor.fetchone()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            access_token = create_access_token(identity={'user_id': user['id'], 'username': user['name'], 'role': user['role']})
            refresh_token = create_refresh_token(identity={'user_id': user['id'], 'username': user['name'], 'role': user['role']})
            return jsonify({
                "message": "Login successful",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "username": user['name'],
                "role": user['role'],
                "userId": user['id']
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

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
# Define your models
class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(50))
    
class JobApplication(db.Model):
    __tablename__ = 'jobapplication' 
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    application_date = db.Column(db.DateTime, default=db.func.current_timestamp())

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        app.logger.info("Fetching statistics...")
        total_jobs = Job.query.count()
        total_users = Users.query.count()
        total_admins = Users.query.filter_by(role='admin').count()
        total_recruiters = Users.query.filter_by(role='recruiter').count()
        total_jobs_applied = db.session.query(db.func.count(JobApplication.id)).scalar()

        stats = {
            'total_jobs': total_jobs,
            'total_users': total_users,
            'total_admins': total_admins,
            'total_recruiters': total_recruiters,
            'total_jobs_applied': total_jobs_applied
        }
        return jsonify(stats)
    except Exception as e:
        app.logger.error(f"Error fetching stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

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
#Update Users in Admin Page
@app.route('/api/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({"error": "Access forbidden"}), 403

    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    role = data.get('role')

    if not name or not email or not role:
        return jsonify({"error": "Name, email, and role are required"}), 422

    conn = create_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "UPDATE users SET name = %s, email = %s, role = %s WHERE id = %s",
            (name, email, role, user_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"message": "User updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()

#Delete Users in Admin Page
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user = get_jwt_identity()
    app.logger.debug(f'Current user: {current_user}') 
    if current_user['role'] != 'admin':
        return jsonify({"error": "Access forbidden"}), 403

    conn = create_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"message": "User deleted successfully"}), 200

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
#Update jobs 
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
#Get Candidate Details 
@app.route('/api/profile/<int:user_id>', methods=['GET'])
@jwt_required()
def get_profile(user_id):
    current_user = get_jwt_identity()
    if current_user['user_id'] != user_id and current_user['role'] != 'admin':
        return jsonify({"error": "Access forbidden"}), 403

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        query = "SELECT id, name, contact, location, email FROM users WHERE id = %s"
        cursor.execute(query, (user_id,))
        user = cursor.fetchone()
        if user:
            return jsonify({"profile": user})
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

#Send Email notification from About Us Page
@app.route('/send-email', methods=['POST'])
def send_email():
    data = request.json
    name = data.get('name', 'No name provided')
    email = data.get('email', 'No email provided')
    message = data.get('message', 'No message provided')

    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')

    # Create the email content
    email_content = f"""
    <html>
    <body>
        <h2>Contact Form Submission</h2>
        <p>Dear Team,</p>
        <p>You have received a new message from <strong>{name}</strong> with the email <strong>{email}</strong>.</p>
        <p><strong>Message:</strong></p>
        <p>{message}</p>
        <p>Please reply to this email at your earliest convenience.</p>
        <p>Best regards,</p>
        <p>Your Website Team</p>
    </body>
    </html>
    """

    msg = MIMEText(email_content, 'html')
    msg['Subject'] = 'New Contact Form Submission'
    msg['From'] = smtp_user
    msg['To'] = 'eddiewithme31@gmail.com'

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, 'eddiewithme31@gmail.com', msg.as_string())
        return jsonify({'status': 'success', 'message': 'Email sent'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.errorhandler(500)
def handle_internal_error(error):
    app.logger.error(f"Internal Server Error: {error}")
    return jsonify({"error": "An internal error occurred. Please try again later."}), 500



if __name__ == '__main__':
    
    app.run(debug=True)
