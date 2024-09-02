import React from 'react';
import { Link } from 'react-router-dom';
import BarChartComponent from '../components/BarChartComponent'; // Adjust the import based on your file structure
import '../styles/RecruiterPage.css';

function RecruiterPage() {
  // Hardcoded stats data
  const stats = {
    total_companies: 10,
    total_candidates: 150,
    jobs_per_company: [
      { company: 'Tech Innovators Inc.', jobs_posted: 5 },
      { company: 'Creative Design Studio', jobs_posted: 2 },
      { company: 'Marketing Wizards Co.', jobs_posted: 2 },
      { company: 'People First Group', jobs_posted: 3 },
      { company: 'Finance Solutions Ltd.', jobs_posted: 8 }
    ],
    candidates_per_company: [
      { company: 'Tech Innovators Inc.', candidates_applied: 9 },
      { company: 'Creative Design Studio', candidates_applied: 6 },
      { company: 'Marketing Wizards Co.', candidates_applied: 5 },
      { company: 'People First Group', candidates_applied: 1},
      { company: 'Finance Solutions Ltd.', candidates_applied: 3 }
    ],
    job_status_counts: {
      received: 30,
      under_review: 20,
      interview_scheduled: 15,
      rejected: 10,
      offer_letter: 5
    }
  };

  return (
    <div className="recruiter-page">
      <div className="sidebar">
        <br />
        <br />
        <br />
        <h2>Recruiter Dashboard</h2>
        <ul>
          <li><Link to="/recruiter">Home</Link></li>
          <li><Link to="/recruiter/jobs">Jobs</Link></li>
          <li><Link to="/recruiter/candidates">Candidates</Link></li>
          <li><Link to="/recruiter/interview">Schedule Interview</Link></li>
          <li><button className="logout-button" onClick={() => window.location.href = '/signin'}>Logout</button></li>
        </ul>
      </div>
      <div className="main-content">
        <br />
        <br />
        <br />
        <h1>Dashboard Overview</h1><br/>
        <div className="stats">
          <div className="stat">
            <h3>Total Companies</h3>
            <p>{stats.total_companies}</p>
          </div>
          <div className="stat">
            <h3>Total Candidates</h3>
            <p>{stats.total_candidates}</p>
          </div>
          <div className="stat">
            <h3>Jobs Posted per Company</h3>
            <p>{stats.jobs_per_company.length > 0 ? stats.jobs_per_company.map(item => (
              <div key={item.company}>{item.company}: {item.jobs_posted}</div>
            )) : 'No data available'}</p>
          </div>
          <div className="stat">
            <h3>Candidates Applied per Company</h3>
            <p>{stats.candidates_per_company.length > 0 ? stats.candidates_per_company.map(item => (
              <div key={item.company}>{item.company}: {item.candidates_applied}</div>
            )) : 'No data available'}</p>
          </div>
          <div className="stat">
            <h3>Job Status Counts</h3>
            <p>
              Received: {stats.job_status_counts.received}<br/>
              Under Review: {stats.job_status_counts.under_review}<br/>
              Interview Scheduled: {stats.job_status_counts.interview_scheduled}<br/>
              Rejected: {stats.job_status_counts.rejected}<br/>
              Offer Letter: {stats.job_status_counts.offer_letter}
            </p>
          </div>
        </div><br/><br/><br/>
        <div>
          <BarChartComponent data={stats} />
        </div>
      </div>
    </div>
  );
}

export default RecruiterPage;
