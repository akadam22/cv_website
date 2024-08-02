import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import '../styles/JobList.css';

Modal.setAppElement('#root'); // Set the root element for accessibility

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: ''
  });

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

  const openModal = (job) => {
    setCurrentJob(job);
    setFormData({
      title: job.JobTitle,
      description: job.JobDescription,
      company: job.Company,
      location: job.Location,
      salary: job.Salary
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/api/jobs/${currentJob.JobID}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}` // Ensure JWT token is sent
      }
    })
    .then(response => {
      // Update job list
      setJobs(jobs.map(job => job.JobID === currentJob.JobID ? { ...job, ...formData } : job));
      console.log('Job updated successfully', response.data);
      closeModal();
    })
    .catch(error => {
      console.error('Error updating job:', error.response ? error.response.data : error.message);
    });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete the job titled "${title}"?`)) {
      axios.delete(`http://localhost:5000/api/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}` // Ensure JWT token is sent
        }
      })
      .then(response => {
        setJobs(jobs.filter(job => job.JobID !== id));
      })
      .catch(error => {
        console.error('Error deleting job:', error.response ? error.response.data : error.message);
      });
    }
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
            <th>Company</th>
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
              <td>{job.Company}</td>
              <td>{job.Location}</td>
              <td>{job.Salary}</td>
              <td className="action-buttons">
                <button onClick={() => openModal(job)}>Edit</button>
                <button onClick={() => handleDelete(job.JobID, job.JobTitle)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/recruiter/jobs/new">
        <button>Post a New Job</button>
      </Link>

      {/* Modal for editing a job */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Job"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Edit Job</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Description:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Company:
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Location:
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Salary:
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Save</button>
          <button type="button" onClick={closeModal}>Cancel</button>
        </form>
      </Modal>
    </div>
  );
}

export default JobList;
