import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiUserFill, RiLockPasswordFill } from 'react-icons/ri'; // Import user and password icons
import SignImage from '../assets/image5.jpeg';
import '../styles/SignInModal.css';

function SignInModal() {
  const [formData, setFormData] = useState({ username: '', password: '' });

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement sign-in logic here using formData state
  };

  return (
    <div className="sign">
      <div className="background-image" style={{backgroundImage: `url(${SignImage})`}}></div>
      <div className="content">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <RiUserFill className="icon" /> {/* User icon */}
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Username"
              className="transparent-input" // Add class for transparent input
            />
          </div>
          <div className="form-group">
            <RiLockPasswordFill className="icon" /> {/* Password icon */}
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
              className="transparent-input" // Add class for transparent input
            />
          </div>
        
          <div className="form-group">
            <button type="submit" className="transparent-button">Sign In</button> {/* Transparent button */}
          </div>
          <div className="form-links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <span> | </span>
            <Link to="/registerform">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignInModal;
