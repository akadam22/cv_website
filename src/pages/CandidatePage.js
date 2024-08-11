import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/CandidatePage.css';
import Sidebar from '../components/Sidebar';

function CandidatePage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [skills, setSkills] = useState([]);
  const [resume, setResume] = useState(null);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileResponse = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!profileResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const profileData = await profileResponse.json();
        setUsername(profileData.username);
        setEmail(profileData.email);
        setContact(profileData.contact);

        // Fetch Skills
        const skillsResponse = await fetch('/api/skills', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!skillsResponse.ok) {
          throw new Error('Network response was not ok');
        }
        const skillsData = await skillsResponse.json();
        setSkills(skillsData);

        // Fetch Resume
        const resumeResponse = await fetch('/api/resume', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!resumeResponse.ok) {
          throw new Error('Network response was not ok');
        }
        const resumeData = await resumeResponse.json();
        setResume(resumeData.file_path);

        // Fetch Experience
        const experienceResponse = await fetch('/api/experience', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!experienceResponse.ok) {
          throw new Error('Network response was not ok');
        }
        const experienceData = await experienceResponse.json();
        setExperience(experienceData);

        // Fetch Education
        const educationResponse = await fetch('/api/education', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!educationResponse.ok) {
          throw new Error('Network response was not ok');
        }
        const educationData = await educationResponse.json();
        setEducation(educationData);

      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  const handlePhotoChange = (e) => {
    setProfilePhoto(URL.createObjectURL(e.target.files[0]));
  };

  const handleEditClick = () => {
    navigate('/candidate/new'); // Use navigate to change routes
  };

  return (
    <div className="candidate-page container">
      <div className="row">
       <Sidebar/>

        {/* Main Content Area */}
        <div className="col-md-9">
          <div className="profile-container">
            <div className="profile-header">
              <h1>{username}'s Profile</h1>
              {profilePhoto && <img src={profilePhoto} alt="Profile" className="profile-photo" />}
              <input type="file" onChange={handlePhotoChange} />
            </div>

            <div className="profile-details">
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Contact:</strong> {contact}</p>

              <h3>Skills</h3>
              <ul>
                {skills.map((skill, index) => (
                  <li key={index}>{skill.skill_name}</li>
                ))}
              </ul>

              <h3>Resume</h3>
              {resume ? (
                <a href={resume} target="_blank" rel="noopener noreferrer">View Resume</a>
              ) : (
                <p>No resume uploaded.</p>
              )}

              <h3>Experience</h3>
              {experience.length > 0 ? (
                <ul>
                  {experience.map((exp, index) => (
                    <li key={index}>
                      <strong>{exp.job_title}</strong> at {exp.company} ({exp.start_date} - {exp.end_date})
                      <p>{exp.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No experience listed.</p>
              )}

              <h3>Education</h3>
              {education.length > 0 ? (
                <ul>
                  {education.map((edu, index) => (
                    <li key={index}>
                      <strong>{edu.degree}</strong> in {edu.field_of_study} from {edu.institution} ({edu.start_date} - {edu.end_date})
                      <p>{edu.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No education listed.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidatePage;
