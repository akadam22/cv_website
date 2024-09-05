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
    role: 'recruiter',
  });
  const [verificationSent, setVerificationSent] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const contactRegex = /^[0-9]{10}$/; // Example for a 10-digit phone number

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.contact || !contactRegex.test(formData.contact)) newErrors.contact = 'Valid contact number is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters long';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     if (!verificationSent) {
//         try {
//             const response = await axios.post('http://localhost:5000/api/send-verification-email', {
//                 email: formData.email,
//             });

//             if (response.data.message) {
//                 setVerificationSent(true);
//                 alert('Verification email sent! Please check your inbox and verify your email.');
//             }
//         } catch (error) {
//             console.error('Error sending verification email:', error.response?.data?.error || error.message);
//             alert('Error: ' + (error.response?.data?.error || 'An error occurred while sending verification email. Please try again.'));
//         }
//     } else {
//         const formDataToSend = new FormData();
//         for (const key in formData) {
//             formDataToSend.append(key, formData[key]);
//         }

//         try {
//             await axios.post('http://localhost:5000/api/registerform', formDataToSend, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
//             alert('User registered successfully! Please check your email to verify your account.');
//             navigate('/signin');
//         } catch (error) {
//             console.error('Error registering user:', error.response?.data?.error || error.message);
//             alert('An error occurred while registering user. Email address already exists.');
//         }
//     }
// };
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
              className={errors.name ? 'error' : ''}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="contact">Contact*</label>
            <input
              type="text"
              id="contact"
              className={errors.contact ? 'error' : ''}
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
            {errors.contact && <p className="error-text">{errors.contact}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="location">Location*</label>
            <input
              type="text"
              id="location"
              className={errors.location ? 'error' : ''}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            {errors.location && <p className="error-text">{errors.location}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              className={errors.email ? 'error' : ''}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password*</label>
            <input
              type="password"
              id="password"
              className={errors.password ? 'error' : ''}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
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
            <button type="submit">{verificationSent ? 'Register' : 'Send Verification Email'}</button>
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
