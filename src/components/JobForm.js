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
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      // Fetch job details for editing
      axios.get(`http://localhost:5000/api/jobs/${id}`)
        .then(response => {
          const job = response.data;
          setTitle(job.title);
          setDescription(job.description);
          setCompany(job.company);
          setLocation(job.location);
          setSalary(job.salary);
        })
        .catch(error => {
          console.error('Error fetching job:', error);
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const job = { title, description, company, location, salary };
    if (id) {
      // Update existing job
      axios.put(`http://localhost:5000/api/jobs/${id}`, job)
        .then(response => {
          navigate('/recruiter/jobs');
        })
        .catch(error => {
          console.error('Error updating job:', error);
        });
    } else {
      // Create new job
      axios.post('http://localhost:5000/api/jobs', job)
        .then(response => {
          navigate('/recruiter/jobs');
        })
        .catch(error => {
          console.error('Error creating job:', error);
        });
    }
  };

  return (
    <div className="job-form-container">
        <br></br><br></br><br></br>
      <div className="job-form">
        <h2>{id ? 'Edit Job' : 'Post a New Job'}</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="title">
            Title:
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label htmlFor="description">
            Description:
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
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
            />
          </label>
          <button type="submit">{id ? 'Update Job' : 'Post Job'}</button>
        </form>
      </div>
    </div>
  );
}

export default JobForm;
