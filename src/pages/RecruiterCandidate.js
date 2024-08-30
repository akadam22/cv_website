import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/RecruiterPage.css';
import { Link } from 'react-router-dom';

function RecruiterPage() {
  const [jobApplications, setJobApplications] = useState([]);

  useEffect(() => {
    const fetchJobApplications = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/job-applications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        console.log('Fetched Job Applications:', response.data);
        setJobApplications(response.data);
      } catch (error) {
        console.error('Error fetching job applications:', error);
      }
    };

    fetchJobApplications();
  }, []);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await axios.put(`http://localhost:4000/api/job-applications/${applicationId}/status`, {
        status: newStatus
      });
      // Update local state to reflect status change
      const updatedApplications = jobApplications.map(application =>
        application.application_id === applicationId
          ? { ...application, status: newStatus }
          : application
      );
      setJobApplications(updatedApplications);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="recruiter-page">
      <div className="sidebar">
        <br />
        <br />
        <br />
        <h2>Recruiter Dashboard</h2>
        <ul>
          <li><Link to="/recruiter">Home</Link></li>
          <li><Link to="/recruiter/jobs">Jobs</Link></li>
          <li><Link to="/recruiter/candidates">Candidates</Link></li>
          <li><Link to="/recruiter/interview">Schedule Interview</Link></li>
          <li><button className="logout-button" onClick={() => window.location.href = '/signin'}>Logout</button></li>
        </ul>
      </div>
      <div className="main-content">
        <br />
        <br />
        <br />
        <h1>Recruiter Dashboard</h1>
        <h2>Job Applications</h2>
        {jobApplications.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Candidate Resume</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {jobApplications.map(application => (
                <tr key={application.application_id}>
                  <td>{application.job_title}</td>
                  <td>{application.company_name}</td>
                  <td>
                    {application.resume_url ? (
                      <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                        View Resume
                      </a>
                    ) : (
                      'No resume submitted'
                    )}
                  </td>
                  <td>
                    <select
                      value={application.status || 'Received'}
                      onChange={(e) => handleStatusChange(application.application_id, e.target.value)}
                    >
                      <option value="Received">Received</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Offer Letter">Offer Letter</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No job applications found.</p>
        )}
      </div>
    </div>
  );
}

export default RecruiterPage;
