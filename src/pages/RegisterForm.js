import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/RegisterForm.css';
import RegisterImage from '../assets/image7.jpeg';

function RegisterForm() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //await axios.post('/api/register', formData);
      await axios.post('http://localhost:5000/api/registerform', formData);
      alert('User registered successfully!');
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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="recruiter">Recruiter</option>
              <option value="candidate">Candidate</option>
              <option value="employer">Employer</option>
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