from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://username:password@localhost/cv_website'
db = SQLAlchemy(app)

class Job(db.Model):
    __tablename__ = 'job'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    company = db.Column(db.String(255), nullable=False)  # Company column
    applications = db.relationship('JobApplication', backref='job', lazy=True)

class JobApplication(db.Model):
    __tablename__ = 'job_application'
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    candidate_name = db.Column(db.String(255), nullable=False)

@app.route('/api/recruiter-stats', methods=['GET'])
def get_recruiter_stats():
    try:
        # Count the number of unique companies
        total_companies = db.session.query(Job.company.distinct()).count()

        # Get the count of jobs posted per company
        jobs_per_company = db.session.query(
            Job.company, db.func.count(Job.id).label('jobs_posted')
        ).group_by(Job.company).all()

        # Get the count of candidates applied per company
        candidates_per_company = db.session.query(
            Job.company, db.func.count(JobApplication.id).label('candidates_applied')
        ).join(Job).group_by(Job.company).all()

        # Convert results to dictionary format
        jobs_dict = {company: jobs_posted for company, jobs_posted in jobs_per_company}
        candidates_dict = {company: candidates_applied for company, candidates_applied in candidates_per_company}

        # Ensure all companies are accounted for in candidates stats
        for company in jobs_dict.keys():
            if company not in candidates_dict:
                candidates_dict[company] = 0

        # Prepare data for frontend
        stats = {
            'total_companies': total_companies,
            'jobs_per_company': [{'company': company, 'jobs_posted': jobs_posted} for company, jobs_posted in jobs_per_company],
            'candidates_per_company': [{'company': company, 'candidates_applied': candidates_dict.get(company, 0)} for company in jobs_dict.keys()]
        }

        return jsonify(stats)
    except Exception as e:
        app.logger.error(f"Error fetching recruiter stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

    try:
        # Count the number of unique companies
        total_companies = db.session.query(Job.company.distinct()).count()
        print(f"Total Companies: {total_companies}")

        # Get the count of jobs posted per company
        jobs_per_company = db.session.query(
            Job.company, db.func.count(Job.id).label('jobs_posted')
        ).group_by(Job.company).all()
        print(f"Jobs per Company: {jobs_per_company}")

        # Get the count of candidates applied per company
        candidates_per_company = db.session.query(
            Job.company, db.func.count(JobApplication.id).label('candidates_applied')
        ).join(Job).group_by(Job.company).all()
        print(f"Candidates per Company: {candidates_per_company}")

        # Convert results to dictionary format
        jobs_dict = {company: jobs_posted for company, jobs_posted in jobs_per_company}
        candidates_dict = {company: candidates_applied for company, candidates_applied in candidates_per_company}

        # Ensure all companies are accounted for in candidates stats
        for company in jobs_dict.keys():
            if company not in candidates_dict:
                candidates_dict[company] = 0

        # Prepare data for frontend
        stats = {
            'total_companies': total_companies,
            'jobs_per_company': [{'company': company, 'jobs_posted': jobs_posted} for company, jobs_posted in jobs_per_company],
            'candidates_per_company': [{'company': company, 'candidates_applied': candidates_dict.get(company, 0)} for company in jobs_dict.keys()]
        }

        return jsonify(stats)
    except Exception as e:
        app.logger.error(f"Error fetching recruiter stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

    try:
        # Count the number of unique companies
        total_companies = db.session.query(Job.company.distinct()).count()

        # Get the count of jobs posted per company
        jobs_per_company = db.session.query(
            Job.company, db.func.count(Job.id).label('jobs_posted')
        ).group_by(Job.company).all()

        # Get the count of candidates applied per company
        candidates_per_company = db.session.query(
            Job.company, db.func.count(JobApplication.id).label('candidates_applied')
        ).join(Job).group_by(Job.company).all()

        # Convert results to dictionary format
        jobs_dict = {company: jobs_posted for company, jobs_posted in jobs_per_company}
        candidates_dict = {company: candidates_applied for company, candidates_applied in candidates_per_company}

        # Ensure all companies are accounted for in candidates stats
        for company in jobs_dict.keys():
            if company not in candidates_dict:
                candidates_dict[company] = 0

        # Prepare data for frontend
        stats = {
            'total_companies': total_companies,
            'jobs_per_company': [{'company': company, 'jobs_posted': jobs_posted} for company, jobs_posted in jobs_per_company],
            'candidates_per_company': [{'company': company, 'candidates_applied': candidates_dict.get(company, 0)} for company in jobs_dict.keys()]
        }

        return jsonify(stats)
    except Exception as e:
        app.logger.error(f"Error fetching recruiter stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
