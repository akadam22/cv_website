import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/RecruiterPage.css';
import { Link } from 'react-router-dom';

function RecruiterPage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/jobs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        console.log('Fetched Jobs:', response.data);

        const jobsWithCandidates = response.data.map(job => ({
          ...job,
          candidates: job.candidates || [] // Default to an empty array if no candidates
        }));

        setJobs(jobsWithCandidates);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  const handleStatusChange = async (jobId, candidateId, newStatus) => {
    try {
      await axios.put(`http://localhost:4000/api/jobs/${jobId}/candidates/${candidateId}`, {
        status: newStatus
      });
      // Refresh job data or update local state
      const updatedJobs = jobs.map(job => {
        if (job.id === jobId) {
          job.candidates = job.candidates.map(candidate => 
            candidate.candidate_id === candidateId
              ? { ...candidate, status: newStatus }
              : candidate
          );
        }
        return job;
      });
      setJobs(updatedJobs);
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
          <li><button className="logout-button" onClick={() => window.location.href = '/signin'}>Logout</button></li>
        </ul>
      </div>
      <div className="main-content">
        <br />
        <br />
        <br />
        <h1>Recruiter Dashboard</h1>
        <h2>Job Applications</h2>
        {jobs.length > 0 ? (
  <table>
    <thead>
      <tr>
        <th>Job Title</th>
        <th>Company</th>
        <th>Candidate Resume</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {jobs.map(job => (
        job.candidates.length > 0 ? (
          job.candidates.map(candidate => (
            <tr key={candidate.application_id}>
              <td>{job.title}</td>
              <td>{job.company}</td>
              <td>
                {candidate.resume_url ? (
                  <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                ) : (
                  'No resume submitted'
                )}
              </td>
              <td>
                <select
                  value={candidate.status}
                  onChange={(e) => handleStatusChange(job.id, candidate.candidate_id, e.target.value)}
                >
                  <option value="Received">Received</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </td>
              <td>
                {/* Additional actions can be added here */}
              </td>
            </tr>
          ))
        ) : (
          <tr key={job.id}>
            <td>{job.title}</td>
            <td>{job.company}</td>
            <td colSpan="3">No candidates have applied.</td>
          </tr>
        )
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
