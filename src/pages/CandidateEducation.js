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
  const [errors, setErrors] = useState({});
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
    const newErrors = {};
    if (!education.institution) newErrors.institution = 'Institution is required';
    if (!education.degree) newErrors.degree = 'Degree is required';
    if (!education.field_of_study) newErrors.field_of_study = 'Field of Study is required';
    if (!education.description) newErrors.description = 'Description is required';
    if (education.start_date && education.end_date && new Date(education.end_date) < new Date(education.start_date)) {
      newErrors.date_range = 'End Date cannot be earlier than Start Date';
    }
    return newErrors;
  };

  const handleUpload = async () => {
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
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
                  className={errors.institution ? 'input-error' : ''}
                />
                {errors.institution && <p className="error-text">{errors.institution}</p>}
              </label>
              <label>
                Degree*:
                <input
                  type="text"
                  name="degree"
                  value={education.degree}
                  onChange={handleInputChange}
                  className={errors.degree ? 'input-error' : ''}
                />
                {errors.degree && <p className="error-text">{errors.degree}</p>}
              </label>
              <label>
                Field of Study*:
                <input
                  type="text"
                  name="field_of_study"
                  value={education.field_of_study}
                  onChange={handleInputChange}
                  className={errors.field_of_study ? 'input-error' : ''}
                />
                {errors.field_of_study && <p className="error-text">{errors.field_of_study}</p>}
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
                {errors.date_range && <p className="error-text">{errors.date_range}</p>}
              </label>
              <label>
                Description*:
                <textarea
                  name="description"
                  value={education.description}
                  onChange={handleInputChange}
                  className={errors.description ? 'input-error' : ''}
                />
                {errors.description && <p className="error-text">{errors.description}</p>}
              </label>
              <button onClick={handleUpload}>Upload Education</button>
              <div className="upload-status">
                {uploadStatus && <p>{uploadStatus}</p>}
              </div>
            </div>
            <div className="education-list">
              {educationList.length > 0 ? (
                educationList.map((edu) => (
                  <div key={edu.id} className="education-item">
                    <h3>{edu.institution}</h3>
                    <p><strong>Degree:</strong> {edu.degree}</p>
                    <p><strong>Field of Study:</strong> {edu.field_of_study}</p>
                    <p><strong>Start Date:</strong> {edu.start_date}</p>
                    <p><strong>End Date:</strong> {edu.end_date}</p>
                    <p><strong>Description:</strong> {edu.description}</p>
                    <button onClick={() => handleDelete(edu.id)}>Delete</button>
                  </div>
                ))
              ) : (
                <p>No education records found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateEducation;
