import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HomeImage from '../assets/image1.png';
import '../styles/HomePage.css';

function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Function to toggle modal and set selected job
  const toggleModal = (job) => {
    setSelectedJob(job);
    setShowModal(!showModal);
  };

  // Function to close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Job data
  const jobData = [
    {
      title: "Software Engineer",
      company: "ABC Tech",
      description: "This is the job description for a software engineer at ABC Tech."
    },
    {
      title: "Marketing Manager",
      company: "XYZ Corporation",
      description: "This is the job description for a marketing manager at XYZ Corporation."
    },
    {
      title: "Financial Analyst",
      company: "DEF Investments",
      description: "This is the job description for a financial analyst at DEF Investments."
    }
  ];

  return (
    <div className="home">
      {/* Background image */}
      <div className="background-image" style={{backgroundImage: `url(${HomeImage})`}}></div>
      
      {/* Content */}
      <div className="content">
        <div className="header">
          <h1>Welcome to Our CV Screening Platform</h1>
          <h2>Find Your Dream Job Faster</h2>
          <p>Our intelligent CV filtering system streamlines the hiring process, connecting talented candidates with top companies.</p>
          <Link to="/menu">
            <button>Create Your Profile</button>
          </Link>
        </div>
        
        {/* Job cards container with white background */}
        <div className="job-cards-section">
          <div className="job-cards-container">
            {jobData.map((job, index) => (
              <div className="job-card" key={index} onClick={() => toggleModal(job)}>
                <h3>{job.title}</h3>
                <p>{job.company}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>{selectedJob.title}</h2>
            <p>{selectedJob.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
