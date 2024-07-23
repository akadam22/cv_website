import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { RiUserFill, RiLockPasswordFill } from 'react-icons/ri'; // Import user and password icons
import SignImage from '../assets/image5.jpeg';
import '../styles/SignInModal.css';

function SignInModal() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/signin', formData);
      const { username, role } = res.data;
      
      // Save user data in localStorage
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      alert('Login successful');
      // Redirect based on user role
      switch (role) {
        case 'candidate':
          navigate('/candidate');
          break;
        case 'recruiter':
          navigate('/recruiter');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/'); // Fallback to home page or any default page
      }
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="sign">
      <div className="background-image" style={{backgroundImage: `url(${SignImage})`}}></div>
      <div className="content">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Username"
              className="transparent-input" // Add class for transparent input
            />
            <RiUserFill className="icon" /> {/* User icon */}
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
              className="transparent-input" // Add class for transparent input
            />
            <RiLockPasswordFill className="icon" /> {/* Password icon */}
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
