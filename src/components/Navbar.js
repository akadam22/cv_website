import React, { useState } from 'react';
import Logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import ReorderIcon from '@mui/icons-material/Reorder';

function Navbar() {
  const [openLinks, setOpenLinks] = useState(false);

  const toggleNavbar = () => {
    setOpenLinks(!openLinks);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = '/'; // Redirect to login page or home
  };

  return (
    <div className="navbar">
      <div className="leftSide" id={openLinks ? "open" : "close"}>
        <Link to="/">
          <img src={Logo} alt="Logo" className="logo" />
        </Link>
        <div className="hiddenLinks">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/jobs">Our Jobs</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/signin">Sign In</Link>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="rightSide">
        <Link to="/">Home</Link>
        <Link to="/about">About Us</Link>
        <Link to="/jobs">Our Jobs</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/signin">Sign In</Link>
        <button onClick={toggleNavbar}><ReorderIcon /></button>
      </div>
    </div>
  );
}

export default Navbar;
