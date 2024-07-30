// src/components/JobManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/JobManagement.css';

function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/jobs')
      .then(response => {
        setJobs(response.data);
      })
      .catch(error => {
        console.error('Error fetching jobs:', error);
      });
  }, []);

  const handleCreateJob = () => {
    // Handle job creation logic
  };

  const handleUpdateJob = () => {
    // Handle job update logic
  };

  const handleDeleteJob = (jobId) => {
    axios.delete(`http://localhost:5000/api/jobs/${jobId}`)
      .then(response => {
        setJobs(jobs.filter(job => job.id !== jobId));
      })
      .catch(error => {
        console.error('Error deleting job:', error);
      });
  };

  return (
    <div className="job-management">
      <h2>Job Management</h2>
      <button onClick={() => setShowModal(true)}>Create Job</button>
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
                <button onClick={() => { setSelectedJob(job); setShowModal(true); }}>Update</button>
                <button onClick={() => handleDeleteJob(job.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <div className="modal">
          {/* Modal content for creating or updating a job */}
          <form onSubmit={selectedJob ? handleUpdateJob : handleCreateJob}>
            <input type="text" name="title" placeholder="Job Title" value={selectedJob?.title || ''} onChange={handleInputChange} required />
            <textarea name="description" placeholder="Job Description" value={selectedJob?.description || ''} onChange={handleInputChange} required />
            <input type="text" name="location" placeholder="Location" value={selectedJob?.location || ''} onChange={handleInputChange} required />
            <input type="number" name="salary" placeholder="Salary" value={selectedJob?.salary || ''} onChange={handleInputChange} required />
            <button type="submit">{selectedJob ? 'Update Job' : 'Create Job'}</button>
            <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default JobManagement;
