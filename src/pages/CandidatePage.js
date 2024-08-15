import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CandidatePage.css';
import Sidebar from '../components/Sidebar';

function CandidatePage() {
  const [username, setUsername] = useState('');
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
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
        const response = await axios.get(`http://localhost:4000/api/job-applications/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        setApplications(response.data);
      } catch (error) {
        console.error('Error fetching job applications:', error);
      }
    };

    // Fetch scheduled interviews
    const fetchInterviews = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/scheduled-interviews/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        setInterviews(response.data);
      } catch (error) {
        console.error('Error fetching scheduled interviews:', error);
      }
    };

    fetchApplications();
    fetchInterviews();
  }, [userId]);

  return (
    <div className="candidate-page">
      <Sidebar />
      <div className="main-content"><br/><br/><br/><br/>
        <h1>Welcome, {username}!</h1>
        <p>This is your candidate dashboard where you can manage your profile, view your resume, and update your details.</p>
<br/><br/>
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
                  <td>{app.title}</td>
                  <td>{app.company}</td>
                  <td>{app.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No job applications found.</p>
        )}

        <h2>Scheduled Interviews</h2>
        {interviews.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((interview, index) => (
                <tr key={index}>
                  <td>{interview.title}</td>
                  <td>{new Date(interview.date).toLocaleDateString()}</td>
                  <td>{interview.time}</td>
                  <td>{interview.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No scheduled interviews found.</p>
        )}
      </div>
    </div>
  );
}

export default CandidatePage;
