import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/RecruiterPage.css';

function RecruiterPage() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Fetch the username from localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  return (
    <div className="recruiter-page">
      <div className="sidebar">
        <br />
        <br />
        <br />
        <h2>Recruiter Dashboard</h2>
        <ul>
          <li><Link to="/recruiter/jobs">Jobs</Link></li>
          <li><Link to="/recruiter/candidates">Candidates</Link></li>
          <li><Link to="/recruiter/settings">Settings</Link></li>
          <li><button className="logout-button" onClick={() => window.location.href = '/signin'}>Logout</button></li>
        </ul>
      </div>
      <div className="main-content">
        <br />
        <br />
        <br />
        <h1>Welcome, {username}!</h1> {/* Displaying the username */}
        <p>This is the recruiter dashboard where you can manage job postings, view candidates, and adjust settings.</p>
      </div>
    </div>
  );
}

export default RecruiterPage;