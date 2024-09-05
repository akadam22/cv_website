import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/RecruiterPage.css';
import { Link } from 'react-router-dom';

function RecruiterCandidate() {
  const [jobApplications, setJobApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All'); // Status filter
  const [searchCompany, setSearchCompany] = useState(''); // Typed company search
  const [companyOptions, setCompanyOptions] = useState([]);

  useEffect(() => {
    const fetchJobApplications = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/job-applications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        console.log('Fetched Job Applications:', response.data);
        setJobApplications(response.data);
        setFilteredApplications(response.data);

        // Extract unique company names for dropdown
        const companies = [...new Set(response.data.map(app => app.company_name))].sort();
        setCompanyOptions(companies);
      } catch (error) {
        console.error('Error fetching job applications:', error);
      }
    };

    fetchJobApplications();
  }, []);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = jobApplications.filter(application => {
      const matchesQuery = application.company_name.toLowerCase().includes(lowercasedQuery);
      const matchesStatus = selectedStatus === 'All' || application.status === selectedStatus;
      const matchesCompany = !searchCompany || application.company_name.toLowerCase().includes(searchCompany.toLowerCase());
      return matchesQuery && matchesStatus && matchesCompany;
    });
    setFilteredApplications(filtered);
  }, [searchQuery, selectedStatus, searchCompany, jobApplications]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      console.log('Updating status for applicationId:', applicationId, 'to', newStatus);
      const response = await axios.put(`http://localhost:4000/api/job-applications/${applicationId}/status`, {
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json'
        }
      });
      // Update state after successful status change
      const updatedApplications = jobApplications.map(application =>
        application.id === applicationId
          ? { ...application, status: newStatus }
          : application
      );
      setJobApplications(updatedApplications);
      setFilteredApplications(updatedApplications);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  

  const handleFeedbackSubmit = async () => {
    try {
      await axios.post(`http://localhost:4000/api/job-applications/${selectedApplication}/feedback`, {
        feedback
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json'
        }
      });
      setFeedback('');
      setShowModal(false);
      alert('Feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className="recruiter-page">
      <div className="sidebar">
        <br />
        <br />
        <br />
        <h2>Recruiter Dashboard</h2>
        <ul>
          <li><Link to="/recruiter">Home</Link></li>
          <li><Link to="/recruiter/jobs">Jobs</Link></li>
          <li><Link to="/recruiter/candidates">Candidates</Link></li>
          <li><button className="logout-button" onClick={() => window.location.href = '/signin'}>Logout</button></li>
        </ul>
      </div>
      <div className="main-content">
        <br />
        <br />
        <br />
        <h1>Recruiter Dashboard</h1>
        <h2>Job Applications</h2>

        {/* Combined Search and Dropdown */}
        <div className="search-dropdown-container">
          <input
            type="text"
            list="company-list"
            placeholder="Type or select a company"
            value={searchCompany}
            onChange={(e) => setSearchCompany(e.target.value)}
            className="search-input"
          />
          <datalist id="company-list">
            {companyOptions.map((company, index) => (
              <option key={index} value={company} />
            ))}
          </datalist>
        </div>

        {/* Status Dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="status-select"
        >
          <option value="All">All Statuses</option>
          <option value="Received">Received</option>
          <option value="Under Review">Under Review</option>
          <option value="Interview Scheduled">Interview Scheduled</option>
          <option value="Offer Letter">Offer Letter</option>
          <option value="Rejected">Rejected</option>
        </select>

        {filteredApplications.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Candidate Resume</th>
                <th>Status</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map(application => (
                <tr key={application.application_id}>
                  <td>{application.job_title}</td>
                  <td>{application.company_name}</td>
                  <td>
                    {application.resume_url ? (
                      <a href={`http://localhost:4000/${application.resume_url}`} target="_blank" rel="noopener noreferrer">
                        View Resume
                      </a>
                    ) : (
                      'No resume submitted'
                    )}
                  </td>
                  <td>
                    <select
                      value={application.status || 'Received'}
                      onChange={(e) => handleStatusChange(application.application_id, e.target.value)}
                    >
                      <option value="Received">Received</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Offer Letter">Offer Letter</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => { setSelectedApplication(application.application_id); setShowModal(true); }}>
                      Give Feedback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No job applications found.</p>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Give Feedback</h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback here"
            />
            <button onClick={handleFeedbackSubmit}>Submit</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterCandidate;
