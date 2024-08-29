import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CandidateJob.css'; // Add your styles here
import Sidebar from '../components/Sidebar';
//fetches jobs and allows the candidate to manually apply job and do search functionality
function CandidateJob() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ title: '', location: '', company: '' });
  const [error, setError] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  // Get userId from localStorage or sessionStorage
  const userId = localStorage.getItem('userId');

  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/jobs', {
        params: filters,
      });
      setJobs(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchJobs();
  };

  const handleApply = async (jobId) => {
    if (!userId) {
      alert('You need to be logged in to apply for jobs.');
      return;
    }
  
    try {
      await axios.post(`http://localhost:4000/api/jobs/${jobId}/apply`, {
        userId
      });
      alert('Application submitted successfully');
    } catch (err) {
      console.error('Error applying for the job:', err);
      alert('Error applying for the job. Please check if you have uploaded your resume or if you have already applied for this job.');
    }
  };
  

  return (
    <div className="job-search-page container">
      <div className="row">
        <div className="col-md-3">
          <Sidebar />
        </div>
        <div className="col-md-9"><br></br><br></br>
          <h1>Search for Jobs</h1>
          <div className="filters">
            <input
              type="text"
              name="title"
              placeholder="Job Title"
              value={filters.title}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="company"
              placeholder="Company"
              value={filters.company}
              onChange={handleInputChange}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          <div className="job-cards">
            {error && <p className="error-message">{error}</p>}
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <h2>{job.title}</h2>
                  <p><strong>Company:</strong> {job.company}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Salary:</strong> ${job.salary}</p>
                  <p>{job.description}</p>
                
                  <button onClick={() => handleApply(job.id)}>Apply</button>
                </div>
              ))
            ) : (
              <p>No jobs found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateJob;
