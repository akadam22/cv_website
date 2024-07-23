import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminPage.css';

function AdminPage() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Fetch the username from localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  return (
    <div className="admin-page">
      <div className="sidebar">
        <br />
        <br />
        <br />
        <h2>Admin Dashboard</h2>
        <ul>
          <li><Link to="/admin/users">Users</Link></li>
          <li><Link to="/admin/reports">Reports</Link></li>
          <li><Link to="/admin/settings">Settings</Link></li>
        </ul>
      </div>
      <div className="main-content">
        <br />
        <br />
        <br />
        <h1>Welcome, {username}!</h1> {/* Displaying the username */}
        <p>This is the admin dashboard where you can manage users, view reports, and adjust settings.</p>
      </div>
    </div>
  );
}

export default AdminPage;
