import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/CandidateInterview.css'; // Add your CSS styles here

function CandidateInterview() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);

  useEffect(() => {
    // Fetch jobs and candidates
    const fetchJobsAndCandidates = async () => {
      try {
        const jobsResponse = await axios.get('http://localhost:5000/api/jobs', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
          withCredentials: true,
        });
        setJobs(jobsResponse.data);

        const candidatesResponse = await axios.get('http://localhost:5000/api/candidates', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
          withCredentials: true,
        });
        setCandidates(candidatesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchJobsAndCandidates();
  }, []);

  const handleScheduleClick = async (jobId, candidateId) => {
    const interviewData = {
      jobId,
      candidateId,
    };

    try {
      await axios.post('http://localhost:5000/api/schedule-interview', interviewData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      alert('Interview scheduled successfully');
    } catch (error) {
      console.error('Error scheduling interview:', error);
    }
  };

  return (
    <div className="candidate-interview">
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
      <h1>Interview Scheduling</h1>
      <table>
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Company</th>
            <th>Candidate Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => 
            candidates.map((candidate) => (
              <tr key={`${job.id}-${candidate.id}`}>
                <td>{job.title}</td>
                <td>{job.company}</td>
                <td>{candidate.name}</td>
                <td>
                  <button 
                    onClick={() => handleScheduleClick(job.id, candidate.id)}
                  >
                    Schedule
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CandidateInterview;
