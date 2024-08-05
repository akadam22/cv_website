import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Fetch jobs from Flask API
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/jobs', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setJobs(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid, attempt to refresh
          const newToken = await refreshToken();
          if (newToken) {
            // Retry the request with the new token
            const retryResponse = await axios.get('http://localhost:5000/api/jobs', {
              headers: {
                Authorization: `Bearer ${newToken}`
              }
            });
            setJobs(retryResponse.data);
          }
        } else {
          console.error('Error fetching jobs:', error.response ? error.response.data : error.message);
        }
      }
    };
    fetchJobs();
  }, []);

  const openModal = (job) => {
    setCurrentJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      salary: job.salary
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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!currentJob?.id) {
      console.error('No Job ID specified for update.');
      return;
    }
  
    try {
      await axios.put(`http://localhost:5000/api/jobs/${currentJob.id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      // Update job list
      setJobs(jobs.map(job => job.id === currentJob.id ? { ...job, ...formData } : job));
      closeModal();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Token might be expired, attempt to refresh
        const newToken = await refreshToken();
        console.log('Access Token:', localStorage.getItem('access_token'));

        if (newToken) {
          // Retry the request with the new token
          await axios.put(`http://localhost:5000/api/jobs/${currentJob.id}`, formData, {
            headers: {
              Authorization: `Bearer ${newToken}`
            }
            
          });
          setJobs(jobs.map(job => job.id === currentJob.id ? { ...job, ...formData } : job));
          closeModal();
        }
      } else {
        console.error('Error updating job:', error.response ? error.response.data : error.message);
      }
    }
  };
  

  const handleDelete = async (id, title) => {
    if (!id) {
      console.error('No ID specified for delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the job titled "${title}"?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setJobs(jobs.filter(job => job.id !== id));
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Token might be expired, attempt to refresh
          const newToken = await refreshToken();
          if (newToken) {
            // Retry the request with the new token
            await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
              headers: {
                Authorization: `Bearer ${newToken}`
              }
            });
            setJobs(jobs.filter(job => job.id !== id));
          }
        } else {
          console.error('Error deleting job:', error.response ? error.response.data : error.message);
        }
      }
    }
  };
  

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
  
      const response = await axios.post('http://localhost:5000/api/token/refresh', {}, {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      });
  
      localStorage.setItem('access_token', response.data.access_token);
      return response.data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error.response ? error.response.data : error.message);
      // Redirect to login or handle refresh failure
      navigate('/recruiter/jobs'); // Adjust routing as needed
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
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.description}</td>
              <td>{job.company}</td>
              <td>{job.location}</td>
              <td>{job.salary}</td>
              <td className="action-buttons">
                <button onClick={() => openModal(job)}>Edit</button>
                <button onClick={() => handleDelete(job.id, job.title)}>Delete</button>
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
