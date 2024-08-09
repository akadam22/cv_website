import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CandidateProfile.css';

function CandidateProfile() {
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    contact: '',
    location: '',
  });
  const [resume, setResume] = useState(null);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [profile, setProfile] = useState([]);
  const [error, setError] = useState([]);
  const userId = 1;

  useEffect(() => {
    console.log('Fetching profile for userId:', userId);  // Debug log
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/profile/${userId}`);
        console.log('Profile data received:', response.data);  // Debug log
        setProfile(response.data.profile);
      } catch (error) {
        console.error('Error fetching profile:', error);  // Debug log
        setError(error.response?.data.error || error.message);
      }
    };
  
    if (userId) {
      fetchProfile();
    }
  }, [userId]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'resume') setResume(files[0]);
  };

  const handleSkillsChange = (index, field, value) => {
    const newSkills = [...skills];
    newSkills[index][field] = value;
    setSkills(newSkills);
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperiences = [...experiences];
    newExperiences[index][field] = value;
    setExperiences(newExperiences);
  };

  const handleEducationChange = (index, field, value) => {
    const newEducations = [...educations];
    newEducations[index][field] = value;
    setEducations(newEducations);
  };

  const addSkill = () => setSkills([...skills, { skill_name: '' }]);
  const addExperience = () => setExperiences([...experiences, { job_title: '', company: '', location: '', start_date: '', end_date: '', description: '' }]);
  const addEducation = () => setEducations([...educations, { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' }]);

  const handleSubmit = () => {
    if (!personalInfo.name || !personalInfo.contact || !personalInfo.location) {
      alert('Please fill out all personal information fields.');
      return;
    }
     // Checking  if at least one skill, experience, and education is provided
  if (!skills.length || !experiences.length || !educations.length) {
    alert('Please add at least one skill, experience, and education.');
    return;
  }
    const formData = new FormData();
    formData.append('name', personalInfo.name);
    formData.append('contact', personalInfo.contact);
    formData.append('location', personalInfo.location);
    if (resume) formData.append('resume', resume);
    formData.append('skills', JSON.stringify(skills));
    formData.append('experiences', JSON.stringify(experiences));
    formData.append('educations', JSON.stringify(educations));

    const url = isUpdate ? '/api/updateProfile' : '/api/addProfile';
    const method = isUpdate ? 'put' : 'post';

    axios({
      method: method,
      url: url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
      },
    })
    .then(response => {
      alert('Profile saved successfully!');
      console.log('Profile data:', response.data);
    })
    .catch(error => {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
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
          <h2>Skills</h2>
          {skills.map((skill, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Skill Name"
                value={skill.skill_name}
                onChange={(e) => handleSkillsChange(index, 'skill_name', e.target.value)}
              />
            </div>
          ))}
          <button onClick={addSkill}>Add Skill</button>
        </div>

        <div className="profile-section">
          <h2>Experience</h2>
          {experiences.map((experience, index) => (
            <div key={index}>
              <label>
                Job Title:
                <input
                  type="text"
                  name="job_title"
                  value={experience.job_title}
                  onChange={(e) => handleExperienceChange(index, 'job_title', e.target.value)}
                />
              </label>
              <label>
                Company:
                <input
                  type="text"
                  name="company"
                  value={experience.company}
                  onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                />
              </label>
              <label>
                Location:
                <input
                  type="text"
                  name="location"
                  value={experience.location}
                  onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                />
              </label>
              <label>
                Start Date:
                <input
                  type="date"
                  name="start_date"
                  value={experience.start_date}
                  onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  name="end_date"
                  value={experience.end_date}
                  onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                />
              </label>
              <label>
                Description:
                <textarea
                  name="description"
                  value={experience.description}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                />
              </label>
            </div>
          ))}
          <button onClick={addExperience}>Add Experience</button>
        </div>

        <div className="profile-section">
          <h2>Education</h2>
          {educations.map((education, index) => (
            <div key={index}>
              <label>
                Institution:
                <input
                  type="text"
                  name="institution"
                  value={education.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                />
              </label>
              <label>
                Degree:
                <input
                  type="text"
                  name="degree"
                  value={education.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                />
              </label>
              <label>
                Field of Study:
                <input
                  type="text"
                  name="field_of_study"
                  value={education.field_of_study}
                  onChange={(e) => handleEducationChange(index, 'field_of_study', e.target.value)}
                />
              </label>
              <label>
                Start Date:
                <input
                  type="date"
                  name="start_date"
                  value={education.start_date}
                  onChange={(e) => handleEducationChange(index, 'start_date', e.target.value)}
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  name="end_date"
                  value={education.end_date}
                  onChange={(e) => handleEducationChange(index, 'end_date', e.target.value)}
                />
              </label>
              <label>
                Description:
                <textarea
                  name="description"
                  value={education.description}
                  onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                />
              </label>
            </div>
          ))}
          <button onClick={addEducation}>Add Education</button>
        </div>

        <div className="profile-section">
          <button onClick={handleSubmit}>{isUpdate ? 'Update Profile' : 'Add Profile'}</button>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;
