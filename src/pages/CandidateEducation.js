import React, { useState } from 'react';
import axios from 'axios';
import '../styles/CandidateExperience.css'; // Reusing the same CSS file
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer'; // Import Footer component

const CandidateEducation = () => {
  const [education, setEducation] = useState({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState(null);
  const userId = 1; // Replace this with logic to get the actual userId from context or JWT

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEducation({ ...education, [name]: value });
  };

  const handleUpload = async () => {
    try {
      setUploadStatus('Uploading...');
      const response = await axios.post(`http://localhost:4000/api/upload-education/${userId}`, education, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
      });
      setUploadStatus('Upload successful!');
      console.log('Education upload response:', response.data);
    } catch (error) {
      console.error('Error uploading education:', error.response?.data || error.message);
      setError(error.response?.data.error || error.message);
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
        <div className="col-md-9">
          <br/><br/><br/>
          <h1>Upload Your Education</h1>
          <div className="experience-container">
            <div className="experience-section">
              <label>
                Institution*:
                <input
                  type="text"
                  name="institution"
                  value={education.institution}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Degree*:
                <input
                  type="text"
                  name="degree"
                  value={education.degree}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Field of Study:
                <input
                  type="text"
                  name="field_of_study"
                  value={education.field_of_study}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Start Date:
                <input
                  type="date"
                  name="start_date"
                  value={education.start_date}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  name="end_date"
                  value={education.end_date}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Description:
                <textarea
                  name="description"
                  value={education.description}
                  onChange={handleInputChange}
                />
              </label>
              <button onClick={handleUpload}>Upload Education</button>
              <div className="upload-status">
                {uploadStatus && <p>{uploadStatus}</p>}
                {error && <p className="error">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateEducation;
