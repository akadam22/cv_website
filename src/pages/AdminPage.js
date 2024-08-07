import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminPage.css'; // Assuming you have this CSS file

function AdminPage() {
  const [stats, setStats] = useState({
    total_jobs: 0,
    total_users: 0,
    total_admins: 0,
    total_recruiters: 0,
    total_jobs_posted: 0
  });

  useEffect(() => {
    // Fetch stats from Flask API
    axios.get('http://localhost:5000/api/stats')
      .then(response => {
        setStats(response.data);
      })
      .catch(error => {
        console.error('Error fetching stats:', error);
      });
  }, []);

  return (
    <div className="admin-page">
      <div className="sidebar">
        <br></br><br></br><br></br>
        <h2>Admin Dashboard</h2>
        <ul>
          <li><a href="/admin/users">Manage Users</a></li>
          <li><a href="/admin/jobs">Manage Jobs</a></li>
          <li><a href="/admin/reports">Reports</a></li>
          <li><button className="logout-button" onClick={() => window.location.href = '/signin'}>Logout</button></li>
        </ul>
      </div>
      <div className="main-content">
        <br></br><br></br><br></br>
        <h1>Dashboard Overview</h1>
        <div className="stats">
          <div className="stat">
            <h3>Total Jobs</h3>
            <p>{stats.total_jobs}</p>
          </div>
          <div className="stat">
            <h3>Total Users</h3>
            <p>{stats.total_users}</p>
          </div>
          <div className="stat">
            <h3>Total Admins</h3>
            <p>{stats.total_admins}</p>
          </div>
          <div className="stat">
            <h3>Total Recruiters</h3>
            <p>{stats.total_recruiters}</p>
          </div>
          <div className="stat">
            <h3>Total Jobs Posted</h3>
            <p>{stats.total_jobs_posted}</p>
          </div>
        </div>
        {/* Include a graph component if needed */}
      </div>
    </div>
  );
}

export default AdminPage;
