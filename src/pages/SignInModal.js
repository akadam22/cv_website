import React from 'react';
import SignImage from '../assets/image5.jpeg';
import '../styles/SignInModal.css';

function SignInModal() {


  return (
    <div className="sign">
      
      <div className="background-image" style={{backgroundImage: `url(${SignImage})`}}></div>

      <div className="content">
       
      </div>
    </div>
  );
}

export default SignInModal;
