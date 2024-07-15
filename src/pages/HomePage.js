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

  return (
    <div className="home">
      {/* Background image */}
      <div className="background-image" style={{ backgroundImage: `url(${HomeImage})` }}></div>
    
    </div>
  );
}

export default HomePage;
