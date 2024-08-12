import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/RegisterForm.css';
import RegisterImage from '../assets/image7.jpeg';

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    location: '',
    email: '',
    password: '',
    role: 'recruiter', // Default role
    profilePicture: '', // Optional, if you want to handle file uploads
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }
    try {
      await axios.post('http://localhost:5000/api/registerform', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('User registered successfully!');
      navigate('/signin'); // Redirect to sign-in page
    } catch (error) {
      console.error('Error registering user:', error);
      alert('An error occurred while registering user. Please try again.');
    }
  };

  return (
    <div className="register">
      <div className="background-image" style={{ backgroundImage: `url(${RegisterImage})` }}></div>
      <div className="content">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name*</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact">Contact*</label>
            <input
              type="text"
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location*</label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password*</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role*</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="admin">Admin</option>
              <option value="recruiter">Recruiter</option>
              <option value="candidate">Candidate</option>
            </select>
          </div>
          <div className="form-group">
            <button type="submit">Register</button>
          </div>
          <div className="form-links">
            <Link to="/signin">Already have an account? Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
