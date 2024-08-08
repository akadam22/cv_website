import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../styles/AdminPage.css'; 
import PieChart from '../components/PieChart';
const socket = io('http://localhost:5000');

function AdminPage() {
  const [stats, setStats] = useState({
    total_jobs: 0,
    total_users: 0,
    total_admins: 0,
    total_recruiters: 0,
    total_jobs_posted: 0
  });
  const [notification, setNotification] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/stats')
      .then(response => {
        setStats(response.data);
      })
      .catch(error => {
        console.error('Error fetching stats:', error);
      });

    socket.on('email_notification', (data) => {
      setNotification(data.message);
      setTimeout(() => setNotification(''), 5000); // Hide notification after 5 seconds
    });

    return () => {
      socket.off('email_notification');
    };
  }, []);

  return (
    <div className="admin-page">
      <div className="sidebar"><br></br><br></br><br></br><br></br>
        <h2>Admin Dashboard</h2>
        <ul>
          <li><a href="/admin/users">Manage Users</a></li>
          <li><a href="/admin/jobs">Manage Jobs</a></li>
          <li><a href="/admin/reports">Reports</a></li>
          <li><button className="logout-button" onClick={() => window.location.href = '/signin'}>Logout</button></li>
        </ul>
      </div>
      <div className="main-content"><br></br><br></br><br></br>
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
        <div>
        <PieChart data={stats} />
        </div>
        {notification && (
          <div className="notification show">
            {notification}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
