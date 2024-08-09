import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/CandidatePage.css';

function CandidatePage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [skills, setSkills] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setUsername(data.username);
        setEmail(data.email);
        setContact(data.contact);
        setSkills(data.skills);
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
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="sidebar">
            <br /><br /><br /><br></br>
            <h2>Candidate Profile</h2>
            <ul>
              <li><Link to="/candidate/profile">Profile</Link></li>
              <li><Link to="/candidate/jobs">Jobs</Link></li>
              <li><Link to="/candidate/settings">Settings</Link></li>
              <li><button className="logout-button" onClick={() => window.location.href = '/signin'}>Logout</button></li>
            </ul>
          </div>
        </div>
        <div className="col-md-9"><br></br><br></br><br></br><br></br>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button className="btn btn-primary" onClick={handleEditClick}>
              Create/Edit Profile
            </button>
          </div>
          <div className="card">
            <div className="card-header text-center">
              <h2>Hello {username}</h2>
              <p className="description">This is your profile page. You can see and update your details below.</p>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Profile Photo */}
                <div className="col-md-4 text-center">
                  <div className="profile-photo">
                    <img
                      src={profilePhoto || 'https://via.placeholder.com/150'}
                      alt="Profile"
                      className="img-fluid rounded-circle mb-3"
                    />
                    <input type="file" className="form-control" onChange={handlePhotoChange} />
                  </div>
                </div>
                <div className="col-md-8">
                  <form>
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={username}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact</label>
                      <input
                        type="text"
                        className="form-control"
                        value={contact}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Skills</label>
                      <input
                        type="text"
                        className="form-control"
                        value={skills}
                        readOnly
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidatePage;
