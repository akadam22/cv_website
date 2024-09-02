import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ManageJobs.css';
//manages jobs on admin dashboard
function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
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
    // Fetch jobs
    axios.get('http://localhost:5000/api/jobs')
      .then(response => {
        setJobs(response.data);
      })
      .catch(error => {
        console.error('Error fetching jobs:', error);
      });

    // Fetch users
    axios.get('http://localhost:5000/api/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  useEffect(() => {
    console.log('Jobs:', jobs);
    console.log('Users:', users);
  }, [jobs, users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
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
        console.log('Jobs Data:', jobs);
console.log('Users Data:', users);

      });
  };

  const handleDeleteJob = (jobId) => {
    axios.delete(`http://localhost:5000/api/jobs/${jobId}`)
      .then(() => {
        setJobs(jobs.filter(job => job.id !== jobId));
      })
      .catch(error => {
        console.error('Error deleting job:', error);
        console.log('Jobs Data:', jobs);
        console.log('Users Data:', users);

      });
  };
  const userIdToName = users.reduce((acc, user) => {
    acc[user.id] = user.name;
    return acc;
  }, {});

  console.log('User ID to Name Mapping:', userIdToName); // Debugging

  return (
    <div className="job-management">
      <div className="sidebar"><br></br><br></br><br></br><br></br>
        <h2>Admin Dashboard</h2>
        <ul>
        <li><a href="/admin">Home</a></li>
          <li><a href="/admin/users">Manage Users</a></li>
          <li><a href="/admin/jobs">Manage Jobs</a></li>
          <li><button className="logout-button" onClick={() => window.location.href = '/signin'}>Logout</button></li>
        </ul>
      </div>
      <h2>Job Management</h2>
      <table className="job-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Company</th>
            <th>Location</th>
            <th>Salary</th>
            <th>Posted By</th>
            {/* <th>Actions</th> */}
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
              <td>{userIdToName[job.posted_by] || 'Unknown'}</td>
              {/* <td>
                <button onClick={() => { setSelectedJob(job); setFormData({ title: job.title, description: job.description, company: job.company, location: job.location, salary: job.salary }); setShowModal(true); }}>Update</button>
                <button onClick={() => handleDeleteJob(job.id)}>Delete</button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <div className="modal">
          <form onSubmit={handleUpdateJob}>
            <input type="text" name="title" placeholder="Job Title" value={formData.title} onChange={handleInputChange} required />
            <textarea name="description" placeholder="Job Description" value={formData.description} onChange={handleInputChange} required />
            <input type="text" name="company" placeholder="Company" value={formData.company} onChange={handleInputChange} required />
            <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required />
            <input type="number" name="salary" placeholder="Salary" value={formData.salary} onChange={handleInputChange} required />
            <button type="submit">Update Job</button>
            <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ManageJobs;
