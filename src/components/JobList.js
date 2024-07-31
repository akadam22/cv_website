import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/JobList.css';

function JobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // Fetch jobs from Flask API
    axios.get('http://localhost:5000/api/jobs')
      .then(response => {
        setJobs(response.data);
      })
      .catch(error => {
        console.error('Error fetching jobs:', error);
      });
  }, []);

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/api/jobs/${id}`)
      .then(response => {
        setJobs(jobs.filter(job => job.JobID !== id));  // Ensure matching key
      })
      .catch(error => {
        console.error('Error deleting job:', error);
      });
  };

  return (
    <div className="job-list">
      <br />
      <br />
      <br />
      <h2>Your Job Postings</h2>
      <table className="job-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Company</th>  {/* Changed from Location to Company */}
            <th>Location</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.JobID}>
              <td>{job.JobTitle}</td>
              <td>{job.JobDescription}</td>
              <td>{job.Company}</td>  {/* Display Company */}
              <td>{job.Location}</td>
              <td>{job.Salary}</td>  {/* Ensure field name is correct */}
              <td className="action-buttons">
                <Link to={`/recruiter/jobs/edit/${job.JobID}`}>
                  <button>Edit</button>
                </Link>
                <button onClick={() => handleDelete(job.JobID)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/recruiter/jobs/new">
        <button>Post a New Job</button>
      </Link>
    </div>
  );
}

export default JobList;
