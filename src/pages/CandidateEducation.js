import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CandidateExperience.css'; 
import Sidebar from '../components/Sidebar';

// Manages education for candidate page
const CandidateEducation = () => {
  const [education, setEducation] = useState({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [educationList, setEducationList] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/education/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          },
        });
        setEducationList(response.data);
      } catch (error) {
        console.error('Error fetching education data:', error.response?.data || error.message);
        setError(error.response?.data.error || error.message);
      }
    };

    fetchEducation();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEducation({ ...education, [name]: value.trim() });
  };

  const validateForm = () => {
    const errors = {};
    if (!education.institution) errors.institution = 'Institution is required';
    if (!education.degree) errors.degree = 'Degree is required';
    if (education.start_date && education.end_date && new Date(education.end_date) < new Date(education.start_date)) {
      errors.date_range = 'End Date cannot be earlier than Start Date';
    }
    return errors;
  };

  const handleUpload = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      for (const [key, message] of Object.entries(errors)) {
        alert(message);
      }
      return;
    }

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
      // Optionally, refresh the list of education data
      const updatedResponse = await axios.get(`http://localhost:4000/api/education/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
      });
      setEducationList(updatedResponse.data);
    } catch (error) {
      console.error('Error uploading education:', error.response?.data || error.message);
      alert('Upload failed: ' + (error.response?.data.error || error.message));
      setUploadStatus('Upload failed.');
    }
  };

  const handleDelete = async (educationId) => {
    try {
      await axios.delete(`http://localhost:4000/api/delete-education/${userId}/${educationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
      });
      setEducationList(educationList.filter(item => item.id !== educationId));
    } catch (error) {
      console.error('Error deleting education data:', error.response?.data || error.message);
      alert('Error deleting education: ' + (error.response?.data.error || error.message));
    }
  };

  return (
    <div className="education-page container">
      <div className="row">
        <div className="col-md-3">
          <Sidebar />
        </div>
        <div className="col-md-9">
          <br /><br /><br />
          <h1>Manage Your Education</h1>
          <div className="education-container">
            <div className="education-section">
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
                {error && <p className="error-text">{error}</p>}
              </div>
            </div>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateEducation;
