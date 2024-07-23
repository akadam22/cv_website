import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/CandidatePage.css';

function CandidatePage() {
  return (
    <div className="candidate-page">
      <div className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li><Link to="/candidate/profile">Profile</Link></li>
          <li><Link to="/candidate/jobs">Jobs</Link></li>
          <li><Link to="/candidate/settings">Settings</Link></li>
        </ul>
      </div>
      <div className="main-content">
        <h1>Welcome, Candidate!</h1>
        <p>This is the candidate dashboard where you can manage your profile, search for jobs, and adjust your settings.</p>
      </div>
    </div>
  );
}

export default CandidatePage;
