import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function VerifyEmail() {
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios.get(`http://localhost:5000/api/verify-email?token=${token}`)
        .then(response => {
          setMessage('Email verified successfully! Redirecting to sign in...');
          setTimeout(() => {
            navigate('/signin'); // Redirect to sign-in page after verification
          }, 2000); // Wait 2 seconds before redirecting
        })
        .catch(error => {
          if (error.response) {
            const status = error.response.status;
            const errorMessage = error.response.data?.error || 'Error verifying email. Please try again.';
            if (status === 400) {
              setMessage('Invalid or expired token.');
            } else if (status === 404) {
              setMessage('Verification endpoint not found.');
            } else {
              setMessage(errorMessage);
            }
          } else {
            setMessage('Network error. Please check your connection and try again.');
          }
        });
    } else {
      setMessage('Token is missing.');
    }
  }, [token, navigate]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
}

export default VerifyEmail;
