import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/RecruiterPage.css';
import { Link } from 'react-router-dom';
import BarChartComponent from '../components/BarChartComponent'; // Make sure this matches your actual component name

function RecruiterPage() {
  const [stats, setStats] = useState({
    total_companies: 0,
    jobs_per_company: [],
    candidates_per_company: [],
  });

  axios.get('http://localhost:5000/api/recruiter-stats')
  .then(response => {
    console.log('Fetched stats:', response.data);
  })
  .catch(error => {
    console.error('Error fetching stats:', error);
  });

  
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
        </div><br/><br/><br/>
        <div>
          <BarChartComponent data={stats} />
        </div>
      </div>
    </div>
  );
}

export default RecruiterPage;
