import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CandidateJob.css'; // Add your styles here
import Sidebar from '../components/Sidebar';

function CandidateJob() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ title: '', location: '', company: '' });
  const [error, setError] = useState(null);

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
                  <a href={`/job/${job.id}`} className="btn btn-primary">View Details</a>
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
