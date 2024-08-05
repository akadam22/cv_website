import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/CandidatePage.css';

function CandidatePage() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Fetch the username from localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  return (
    <div className="candidate-page">
      <div className="sidebar">
        <br></br>
        <br></br>
        <br></br>
        <h2>Candidate Profile</h2>
        <ul>
          <li><Link to="/candidate/profile">Profile</Link></li>
          <li><Link to="/candidate/jobs">Jobs</Link></li>
          <li><Link to="/candidate/settings">Settings</Link></li>
          <li><button className="logout-button" onClick={() => window.location.href = '/'}>Logout</button></li>
        </ul>
      </div>
      <div className="main-content"><br></br><br></br><br></br>
        <h1>Welcome, {username}!</h1> {/* Displaying the username */}
        <p>This is the candidate dashboard where you can manage your profile, search for jobs, and adjust your settings.</p>
      </div>
    </div>
  );
}

export default CandidatePage;
