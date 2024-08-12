import React, { useState, useEffect } from 'react';
import '../styles/CandidatePage.css';
import Sidebar from '../components/Sidebar';

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
      <Sidebar />
      <div className="main-content">
        <br />
        <br />
        <br />
        <h1>Welcome, {username}!</h1>
        <p>This is your candidate dashboard where you can manage your profile, view your resume, and update your details.</p>
      </div>
    </div>
  );
}

export default CandidatePage;
