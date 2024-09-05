import React, { useState } from 'react';
import axios from 'axios';
import '../styles/CandidateExperience.css'; // Ensure this file includes necessary styles
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer'; // Import Footer component

// Manages experience for candidate page
function CandidateExperience() {
  const [experience, setExperience] = useState({
    job_title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [uploadStatus, setUploadStatus] = useState('');
  const userId = localStorage.getItem('userId');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Trim the value before setting the state
    setExperience({ ...experience, [name]: value.trim() });
  };

  const validateForm = () => {
    const errors = {};
    if (!experience.job_title) errors.job_title = 'Job Title is required';
    if (!experience.company) errors.company = 'Company is required';
    if (experience.start_date && experience.end_date && new Date(experience.end_date) < new Date(experience.start_date)) {
      errors.date_range = 'End Date cannot be earlier than Start Date';
    }
    return errors;
  };

  const handleUpload = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      // Display validation errors using alert
      for (const [key, message] of Object.entries(errors)) {
        alert(message);
      }
      return;
    }

    try {
      setUploadStatus('Uploading...');
      const response = await axios.post(`http://localhost:4000/api/upload-experience/${userId}`, experience, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
      });
      alert('Upload successful!');
      setUploadStatus('Upload successful!');
      console.log('Experience upload response:', response.data);
    } catch (error) {
      console.error('Error uploading experience:', error.response?.data || error.message);
      alert('Upload failed: ' + (error.response?.data.error || error.message));
      setUploadStatus('Upload failed.');
    }
  };

  return (
    <div className="experience-page container">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="col-md-9"><br /><br /><br />
          <h1>Upload Your Work Experience</h1>
          <div className="experience-container">
            <div className="experience-section">
              <label>
                Job Title*:
                <input
                  type="text"
                  name="job_title"
                  value={experience.job_title}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Company*:
                <input
                  type="text"
                  name="company"
                  value={experience.company}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Location:
                <input
                  type="text"
                  name="location"
                  value={experience.location}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Start Date:
                <input
                  type="date"
                  name="start_date"
                  value={experience.start_date}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  name="end_date"
                  value={experience.end_date}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Description:
                <textarea
                  name="description"
                  value={experience.description}
                  onChange={handleInputChange}
                />
              </label>
              <button onClick={handleUpload}>Upload Experience</button>
              <div className="upload-status">
                {uploadStatus && <p>{uploadStatus}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateExperience;
