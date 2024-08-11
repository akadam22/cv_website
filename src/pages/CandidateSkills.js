import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar'; // Assuming you have a Sidebar component
import '../styles/CandidateSkills.css'; // Reusing the same CSS file

const CandidateSkills = () => {
  const [formData, setFormData] = useState({
    skill_name: '',
    proficiency: '', // e.g., Beginner, Intermediate, Expert
    years_of_experience: '',
    description: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpload = async () => {
    try {
      const userId = 1; // Replace with dynamic user ID if necessary
      const response = await axios.post(`http://localhost:5000/api/upload-skills/${userId}`, formData);
      console.log('Success:', response.data.message);
    } catch (error) {
      console.error('Error uploading skills:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="skills-page container">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="col-md-9">
          <br></br><br></br><br></br>
          <br></br><br></br><br></br>
          <h2 className="form-title">Upload Skills</h2>
          <div className="experience-container">
            <form className="experience-form">
              <input
                type="text"
                name="skill_name"
                placeholder="Skill Name"
                className="form-input"
                onChange={handleChange}
              />
              {/* Dropdown for Proficiency */}
              <select
                name="proficiency"
                className="form-input"
                value={formData.proficiency}
                onChange={handleChange}
              >
                <option value="" disabled>Select Proficiency</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
              <input
                type="number"
                name="years_of_experience"
                placeholder="Years of Experience"
                className="form-input"
                onChange={handleChange}
              />
              <textarea
                name="description"
                placeholder="Description"
                className="form-input"
                onChange={handleChange}
              ></textarea>
              <button type="button" className="form-button" onClick={handleUpload}>
                Upload
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateSkills;
