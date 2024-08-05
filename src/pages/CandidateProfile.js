import React, { useState } from 'react';
import axios from 'axios';
import '../styles/CandidateProfile.css';

function CandidateProfile() {
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    contact: '',
    location: ''
  });
  const [resume, setResume] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'resume') setResume(files[0]);
    if (name === 'profilePicture') setProfilePicture(files[0]);
  };

  const handleUpdate = () => {
    // Implement update functionality
    axios.put('/api/updateProfile', { personalInfo, resume, profilePicture, skills, experience, education })
      .then(response => {
        // Handle success
        alert('Profile updated successfully!');
      })
      .catch(error => {
        // Handle error
        console.error('Error updating profile:', error);
      });
  };

  return (
    <div className="profile-page">
      <h1>Profile Page</h1>
      <div className="profile-container">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <label>
            Name:
            <input type="text" name="name" value={personalInfo.name} onChange={handleInputChange} />
          </label>
          <label>
            Contact:
            <input type="text" name="contact" value={personalInfo.contact} onChange={handleInputChange} />
          </label>
          <label>
            Location:
            <input type="text" name="location" value={personalInfo.location} onChange={handleInputChange} />
          </label>
        </div>

        <div className="profile-section">
          <h2>Resume/CV</h2>
          <input type="file" name="resume" onChange={handleFileChange} />
          {resume && <p>Current Resume: {resume.name}</p>}
        </div>

        <div className="profile-section">
          <h2>Skills and Experience</h2>
          <textarea placeholder="Skills" value={skills} onChange={(e) => setSkills(e.target.value)}></textarea>
          <textarea placeholder="Experience" value={experience} onChange={(e) => setExperience(e.target.value)}></textarea>
          <textarea placeholder="Education" value={education} onChange={(e) => setEducation(e.target.value)}></textarea>
        </div>

        <div className="profile-section">
          <h2>Profile Picture</h2>
          <input type="file" name="profilePicture" onChange={handleFileChange} />
          {profilePicture && <p>Current Profile Picture: {profilePicture.name}</p>}
        </div>

        <div className="profile-section">
          <h2>Account Settings</h2>
          <button onClick={handleUpdate}>Save Profile</button>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;
