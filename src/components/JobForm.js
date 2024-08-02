import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/JobForm.css';

function JobForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      // Fetch job details for editing
      axios.get(`http://localhost:5000/api/jobs/${id}`)
        .then(response => {
          const job = response.data;
          setTitle(job.JobTitle);
          setDescription(job.JobDescription);
          setCompany(job.Company);
          setLocation(job.Location);
          setSalary(job.Salary);
        })
        .catch(error => {
          setError('Error fetching job details.');
          console.error('Error fetching job:', error);
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (isNaN(salary) || parseFloat(salary) <= 0) {
      setError('Please enter a valid salary.');
      return;
    }

    const job = { title, description, company, location, salary };

    const token = localStorage.getItem('access_token');
    console.log('Access Token:', token); // Log the access token

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (id) {
      // Update existing job
      axios.put(`http://localhost:5000/api/jobs/${id}`, job, config)
        .then(response => {
          alert('Job updated successfully!');
          navigate('/recruiter/jobs');
        })
        .catch(error => {
          alert('Error updating job: ' + error.message);
          console.error('Error updating job:', error);
        });
    } else {
      // Create new job
      axios.post('http://localhost:5000/api/jobs', job, config)
        .then(response => {
          alert('Job created successfully!');
          navigate('/recruiter/jobs');
        })
        .catch(error => {
          alert('Error creating job: ' + error.message);
          console.error('Error creating job:', error);
        });
    }
  };

  return (
    <div className="job-form-container">
      <br /><br /><br />
      <div className="job-form">
        <h2>{id ? 'Edit Job' : 'Post a New Job'}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="title">
            Title:
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoComplete="job-title"
            />
          </label>
          <label htmlFor="description">
            Description:
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              autoComplete="job-description"
            />
          </label>
          <label htmlFor="company">
            Company:
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              autoComplete="company-name"
            />
          </label>
          <label htmlFor="location">
            Location:
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              autoComplete="job-location"
            />
          </label>
          <label htmlFor="salary">
            Salary:
            <input
              id="salary"
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
              autoComplete="job-salary"
            />
          </label>
          <button type="submit">{id ? 'Update Job' : 'Post Job'}</button>
        </form>
      </div>
    </div>
  );
}

export default JobForm;
