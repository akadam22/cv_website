// Sidebar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';


function Sidebar() {
  const navigate = useNavigate(); // Hook for navigation

  const handleLogout = () => {
    // Implement logout functionality here, e.g., clearing token, redirecting
    window.location.href = '/signin';
  };

  return (
    <div className="sidebar">
      <br /><br /><br /><br></br>
      <h2>Candidate Profile</h2>
      <ul>
      <li><Link to="/candidate">Home</Link></li>
        <li><Link to="/candidate/new">My Profile</Link></li>
        <li><Link to="/candidate/jobs">Jobs</Link></li>
        <li><Link to="/candidate/resume">Resume Upload</Link></li>
        <li><Link to="/candidate/experience">Experience</Link></li>
        <li><Link to="/candidate/education">Education</Link></li>
        <li><Link to="/candidate/skills">Skills</Link></li>

        <li><button className="logout-button" onClick={handleLogout}>Logout</button></li>
      </ul>
    </div>
  );
}

export default Sidebar;
