import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CandidateResume.css';
import Sidebar from '../components/Sidebar';

function CandidateResume() {
  const [resume, setResume] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);
  const userId = 1; // Replace this with logic to get the actual userId

  useEffect(() => {
    const fetchCurrentResume = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get-resume/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          },
        });
        setCurrentResume(response.data.resume); // Assuming response contains resume info
      } catch (error) {
        console.error('Error fetching current resume:', error.response?.data || error.message);
        setError(error.response?.data.error || error.message);
      }
    };

    fetchCurrentResume();
  }, [userId]);

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!resume) {
      alert('Please select a resume file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resume);

    try {
      setUploadStatus('Uploading...');
      const response = await axios.post(`http://localhost:4000/api/upload-resume/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
      });
      setUploadStatus('Upload successful!');
      setCurrentResume({ url: response.data.filePath }); // Update current resume info
    } catch (error) {
      console.error('Error uploading resume:', error.response?.data || error.message);
      setError(error.response?.data.error || error.message);
      setUploadStatus('Upload failed.');
    }
  };

  return (
    <div className="resume-page container">
      <div className="row">
        <div className="col-md-3">
          <Sidebar />
        </div>
        <div className="col-md-9">
          <br /><br /><br />
          <h1>Upload Your Resume</h1><br />
          <div className="resume-container">
            <div className="resume-section">
              {currentResume ? (
                <div>
                  <h2>Current Resume</h2>
                  <a href={currentResume.url} target="_blank" rel="noopener noreferrer">View Current Resume</a>
                </div>
              ) : (
                <p>No resume uploaded yet.</p>
              )}
              <label>
                Select Resume*:
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </label>
              <button onClick={handleUpload}>Upload Resume</button>
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
}

export default CandidateResume;
