import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ManageJobs.css';

function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: ''
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/jobs')
      .then(response => {
        setJobs(response.data);
      })
      .catch(error => {
        console.error('Error fetching jobs:', error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCreateJob = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/jobs', formData)
      .then(response => {
        setJobs([...jobs, response.data]);
        setShowModal(false);
      })
      .catch(error => {
        console.error('Error creating job:', error);
      });
  };

  const handleUpdateJob = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/api/jobs/${selectedJob.id}`, formData)
      .then(response => {
        setJobs(jobs.map(job => job.id === selectedJob.id ? response.data : job));
        setShowModal(false);
      })
      .catch(error => {
        console.error('Error updating job:', error);
      });
  };

  const handleDeleteJob = (jobId) => {
    axios.delete(`http://localhost:5000/api/jobs/${jobId}`)
      .then(() => {
        setJobs(jobs.filter(job => job.id !== jobId));
      })
      .catch(error => {
        console.error('Error deleting job:', error);
      });
  };

  return (
    <div className="job-management">
      <h2>Job Management</h2>
      <button onClick={() => { setSelectedJob(null); setFormData({ title: '', description: '', company: '', location: '', salary: '' }); setShowModal(true); }}>Create Job</button>
      <table className="job-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Company</th>
            <th>Location</th>
            <th>Salary</th>
            <th>Posted By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.description}</td>
              <td>{job.company}</td>
              <td>{job.location}</td>
              <td>{job.salary}</td>
              <td>{job.posted_by}</td>
              <td>
                <button onClick={() => { setSelectedJob(job); setFormData(job); setShowModal(true); }}>Update</button>
                <button onClick={() => handleDeleteJob(job.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <div className="modal">
          <form onSubmit={selectedJob ? handleUpdateJob : handleCreateJob}>
            <input type="text" name="title" placeholder="Job Title" value={formData.title} onChange={handleInputChange} required />
            <textarea name="description" placeholder="Job Description" value={formData.description} onChange={handleInputChange} required />
            <input type="text" name="company" placeholder="Company" value={formData.company} onChange={handleInputChange} required />
            <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required />
            <input type="number" name="salary" placeholder="Salary" value={formData.salary} onChange={handleInputChange} required />
            <button type="submit">{selectedJob ? 'Update Job' : 'Create Job'}</button>
            <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default JobManagement;
