import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // If you're using React Router for navigation
import '../styles/RegisterForm.css';
import RegisterImage from '../assets/image7.jpeg';

function RegisterForm() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement registration logic here using formData state
  };

  return (
    <div className="register">
      <div className="background-image" style={{backgroundImage: `url(${RegisterImage})`}}></div>
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
