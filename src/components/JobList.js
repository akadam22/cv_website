import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/JobList.css';

function JobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // Fetch jobs from Flask API
    axios.get('http://localhost:5000/api/recruiter/jobs')
      .then(response => {
        setJobs(response.data);
      })
      .catch(error => {
        console.error('Error fetching jobs:', error);
      });
  }, []);

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/api/recruiter/jobs/${id}`)
      .then(response => {
        setJobs(jobs.filter(job => job.id !== id));
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
            <th>Location</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.description}</td>
              <td>{job.location}</td>
              <td>{job.salary}</td>
              <td>
                <Link to={`/recruiter/jobs/edit/${job.id}`}>
                  <button>Edit</button>
                </Link>
                <button onClick={() => handleDelete(job.id)}>Delete</button>
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
