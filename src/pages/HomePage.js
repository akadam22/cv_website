// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import HomeImage from '../assets/image1.png';  // Replace with your actual image
// import CompanyLogo1 from '../assets/company-logo1.png';  // Replace with your actual logo images
// import CompanyLogo2 from '../assets/company-logo2.png';
// import CompanyLogo3 from '../assets/company-logo3.png';
// import CompanyLogo4 from '../assets/company-logo4.png';
// import CompanyLogo5 from '../assets/company-logo5.png';
// import CompanyLogo6 from '../assets/company-logo6.png';
// import CompanyLogo7 from '../assets/company-logo7.png';
// import CompanyLogo8 from '../assets/company-logo8.png';
// import CompanyLogo9 from '../assets/company-logo9.png';
// import CompanyLogo10 from '../assets/company-logo10.png';
// import '../styles/HomePage.css';

// function HomePage() {
//   const [showModal, setShowModal] = useState(false);
//   const [selectedFeature, setSelectedFeature] = useState(null);

//   const companies = [
//     { name: 'Amazon', logo: CompanyLogo1 },
//     { name: 'Articulate', logo: CompanyLogo2 },
//     { name: 'Visa', logo: CompanyLogo3 },
//     { name: 'Apple', logo: CompanyLogo4 },
//     { name: 'Hp', logo: CompanyLogo5 },
//     { name: 'Louis Vuitton', logo: CompanyLogo6 },
//     { name: 'PWC', logo: CompanyLogo7 },
//     { name: 'Microsoft', logo: CompanyLogo8 },
//     { name: 'Tesla', logo: CompanyLogo9 },
//     { name: 'Salesforce', logo: CompanyLogo10 },
//   ];

//   const featureDetails = {
//     'Feature 1': (
//       <div>
//         <h3>Top Companies</h3>
//         <p>Companies that we work with and are happy to join you in their big family.</p>
//         <div className="company-logos">
//           {companies.map((company, index) => (
//             <div key={index} className="company-item">
//               <img src={company.logo} alt={company.name} className="company-logo" />
//               <p>{company.name}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     ),
//     'Feature 2': (
//       <div>
//         <h3>Feature 2</h3>
//         <p>Talk to Customer Service.</p>
//         {/* Additional details for Feature 2 */}
//       </div>
//     ),
//   };

//   const toggleModal = (feature) => {
//     setSelectedFeature(feature);
//     setShowModal(!showModal);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//   };

//   return (
//     <div className="home">
//       {/* Hero Section */}
//       <div className="hero-section">
//         <div className="background-image" style={{ backgroundImage: `url(${HomeImage})` }}>
//           <div className="hero-overlay">
//             <h1>Welcome to Application Tracking System.</h1>
//             <p>Discover how we can help you streamline your processes.</p>
//             <Link to="/about" className="cta-button">Learn More</Link>
//           </div>
//         </div>
//       </div>

//       {/* Features Section */}
//       <div className="features-section">
//         <h2>Features</h2>
//         <div className="feature-item">
//           <h3>Top Companies</h3>
//           <p>Companies that we work with and are happy to join you in their big family.</p>
//           <button onClick={() => toggleModal('Feature 1')}>Check Out</button>
//         </div>
//         <div className="feature-item">
//           <h3>Feature 2</h3>
//           <p>Talk to Customer Service.</p>
//           <button onClick={() => toggleModal('Feature 2')}>Chat Us</button>
//         </div>
//         {/* Add more features as needed */}
//       </div>

//       {/* Modal Component */}
//       {showModal && (
//         <div className="modal-overlay" onClick={closeModal}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             {featureDetails[selectedFeature]}
//             <button onClick={closeModal}>Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default HomePage;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HomeImage from '../assets/image1.png';
import CompanyLogo1 from '../assets/company-logo1.png';
import CompanyLogo2 from '../assets/company-logo2.png';
import CompanyLogo3 from '../assets/company-logo3.png';
import CompanyLogo4 from '../assets/company-logo4.png';
import CompanyLogo5 from '../assets/company-logo5.png';
import CompanyLogo6 from '../assets/company-logo6.png';
import CompanyLogo7 from '../assets/company-logo7.png';
import CompanyLogo8 from '../assets/company-logo8.png';
import CompanyLogo9 from '../assets/company-logo9.png';
import CompanyLogo10 from '../assets/company-logo10.png';
import '../styles/HomePage.css';

function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const companies = [
    { name: 'Amazon', logo: CompanyLogo1 },
    { name: 'Articulate', logo: CompanyLogo2 },
    { name: 'Visa', logo: CompanyLogo3 },
    { name: 'Apple', logo: CompanyLogo4 },
    { name: 'Hp', logo: CompanyLogo5 },
    { name: 'Louis Vuitton', logo: CompanyLogo6 },
    { name: 'PWC', logo: CompanyLogo7 },
    { name: 'Microsoft', logo: CompanyLogo8 },
    { name: 'Tesla', logo: CompanyLogo9 },
    { name: 'Salesforce', logo: CompanyLogo10 },
  ];

  const featureDetails = {
    'Feature 1': (
      <div>
        <h3>Top Companies</h3>
        <p>Companies that we work with and are happy to join you in their big family.</p>
        <div className="company-logos">
          {companies.map((company, index) => (
            <div key={index} className="company-item">
              <img src={company.logo} alt={company.name} className="company-logo" />
              <p>{company.name}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    'Feature 2': (
      <div>
        <h3>Feature 2</h3>
        <p>Talk to Customer Service.</p>
      </div>
    ),
  };

  const toggleModal = (feature) => {
    setSelectedFeature(feature);
    setShowModal(!showModal);

    if (feature === 'Feature 2' && !window.Tawk_API) {
      // Dynamically load the Tawk.to script
      const script = document.createElement('script');
      script.src = 'https://tawk.to/chat/66b3912332dca6db2cbb076d/1i4mmtta1'; // Replace with your actual Tawk.to widget ID
      script.async = true;
      document.body.appendChild(script);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    // Cleanup: remove Tawk.to script on component unmount
    return () => {
      const script = document.querySelector('script[src*="tawk.to"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="background-image" style={{ backgroundImage: `url(${HomeImage})` }}>
          <div className="hero-overlay">
            <h1>Welcome to Application Tracking System.</h1>
            <p>Discover how we can help you streamline your processes.</p>
            <Link href="/about" className="cta-button">Learn More</Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Features</h2>
        <div className="feature-item">
          <h3>Top Companies</h3>
          <p>Companies that we work with and are happy to join you in their big family.</p>
          <button onClick={() => toggleModal('Feature 1')}>Check Out</button>
        </div>
        <div className="feature-item">
          <h3>Feature 2</h3>
          <p>Talk to Customer Service.</p>
          <button onClick={() => toggleModal('Feature 2')}>Chat Us</button>
        </div>
      </div>

      {/* Modal Component */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {featureDetails[selectedFeature]}
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
