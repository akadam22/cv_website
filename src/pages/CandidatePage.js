import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CandidatePage.css';
import Sidebar from '../components/Sidebar';

function CandidatePage() {
  const [username, setUsername] = useState('');
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const userId = localStorage.getItem('userId'); // Fetch userId from local storage

  useEffect(() => {
    // Fetch the username from localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }

    // Fetch job applications
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/candidate-applications/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        setApplications(response.data);
      } catch (error) {
        console.error('Error fetching job applications:', error.response?.data || error.message);
      }
    };

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/notifications/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error.response?.data || error.message);
      }
    };

    fetchApplications();
    fetchNotifications();
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:4000/api/notifications/${notificationId}/read`, null, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error.response?.data || error.message);
    }
  };

  return (
    <div className="candidate-page">
      <Sidebar />
      <div className="main-content">
        <br/><br/>
        <h1>Welcome, {username}!</h1>
        <p>This is your candidate dashboard where you can manage your profile, upload and view your resume, and update your details.</p>
        <br></br>
        <p><b>Application with status AppliedS = Applied by System and Applied = Applied by Candidate</b></p>
        <h2>Your Job Applications</h2>
        {applications.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr key={index}>
                  <td>{app.jobTitle}</td>
                  <td>{app.company}</td>
                  <td>{app.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No job applications found.</p>
        )}

        {/* <h2>Your Notifications</h2>
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((notif) => (
              <li key={notif.id} className={notif.is_read ? 'read' : 'unread'}>
                <p>{notif.message}</p>
                <small>{new Date(notif.created_at).toLocaleString()}</small>
                {!notif.is_read && (
                  <button onClick={() => markAsRead(notif.id)}>Mark as Read</button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No notifications found.</p>
        )} */}
      </div>
    </div>
  );
}

export default CandidatePage;
