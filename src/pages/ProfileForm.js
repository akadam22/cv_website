import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfileForm.css'; // Add your styling here

function ProfileForm() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
      }
    })
    .then(response => {
      setProfile(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching profile data:', error);
      setError('Error fetching profile data');
    setLoading(false);
    });
  }, []);

  const handleEdit = () => {
    navigate('/candidate/new');
  };

  if (!profile) {
    return (
      <div className="no-profile"><br></br>
        <p>No profile created yet.</p>
        <button onClick={handleEdit}>Create Profile</button>
      </div>
    );
  }

  return (
    <div className="candidate-profile">
      <div className="profile-header">
        <div className="profile-name-section">
          <h1>{profile.name}</h1>
          <button onClick={handleEdit} className="edit-profile-button">Edit Profile</button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <ul>
            <li>Personal Information</li>
            <li>Career History</li>
            <li>Education History</li>
            <li>Skills</li>
            <li>Portfolio</li>
            <li>Activity</li>
          </ul>
        </div>

        <div className="profile-details">
          <div className="profile-section">
            <h2>Personal Information</h2>
            <p>Name: {profile.name}</p>
            <p>Contact: {profile.contact}</p>
            <p>Location: {profile.location}</p>
            <p>Salary: {profile.salary}</p>
          </div>

          <div className="profile-section">
            <h2>Skills</h2>
            <ul>
              {profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <li key={index}>{skill.skill_name}</li>
                ))
              ) : (
                <li>No skills added.</li>
              )}
            </ul>
          </div>

          <div className="profile-section">
            <h2>Experience</h2>
            <ul>
              {profile.experience.length > 0 ? (
                profile.experience.map((exp, index) => (
                  <li key={index}>
                    <p><strong>Job Title:</strong> {exp.job_title}</p>
                    <p><strong>Company:</strong> {exp.company}</p>
                    <p><strong>Location:</strong> {exp.location}</p>
                    <p><strong>Start Date:</strong> {exp.start_date}</p>
                    <p><strong>End Date:</strong> {exp.end_date}</p>
                    <p><strong>Description:</strong> {exp.description}</p>
                  </li>
                ))
              ) : (
                <li>No experience listed.</li>
              )}
            </ul>
          </div>

          <div className="profile-section">
            <h2>Education</h2>
            <ul>
              {profile.education.length > 0 ? (
                profile.education.map((edu, index) => (
                  <li key={index}>
                    <p><strong>Institution:</strong> {edu.institution}</p>
                    <p><strong>Degree:</strong> {edu.degree}</p>
                    <p><strong>Field of Study:</strong> {edu.field_of_study}</p>
                    <p><strong>Start Date:</strong> {edu.start_date}</p>
                    <p><strong>End Date:</strong> {edu.end_date}</p>
                    <p><strong>Description:</strong> {edu.description}</p>
                  </li>
                ))
              ) : (
                <li>No education listed.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileForm;
