// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import '../styles/CandidateProfile.css';
// import Sidebar from '../components/Sidebar';
// //manages profile for candidate page.
// function CandidateProfile() {
//   const [personalInfo, setPersonalInfo] = useState({
//     name: '',
//     contact: '',
//     location: '',
//     email: ''
//   });
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       const userId = localStorage.getItem('userId');
//       const jwtToken = localStorage.getItem('jwtToken');
    
//       if (!userId || !jwtToken) {
//         setError('User ID or JWT token is missing. Please log in again.');
//         return;
//       }
    
//       try {
//         const response = await axios.get(`http://localhost:4000/api/profile/${userId}`, {
//           headers: {
//             'Authorization': `Bearer ${jwtToken}`,
//             'Content-Type': 'application/x-www-form-urlencoded',
//           }
//         });
    
//         if (response.status === 200) {
//           setPersonalInfo({
//             name: response.data.name || '',
//             contact: response.data.contact || '',
//             location: response.data.location || '',
//             email: response.data.email || ''
//           });
//         } else {
//           setError(`Error: Received unexpected status code ${response.status}`);
//         }
//       } catch (error) {
//         // Improved error logging
//         console.error('Error fetching profile:', error);
    
//         // Handling different types of errors
//         if (error.response) {
//           // Server responded with a status other than 2xx
//           console.error('Error response data:', error.response.data);
//           console.error('Error response status:', error.response.status);
//           console.error('Error response headers:', error.response.headers);
//           setError(`Error fetching profile: ${error.response.data.error || error.message}`);
//         } else if (error.request) {
//           // Request was made but no response received
//           console.error('Error request data:', error.request);
//           setError('Error fetching profile: No response received from server');
//         } else {
//           // Something else went wrong
//           console.error('Error message:', error.message);
//           setError(`Error fetching profile: ${error.message}`);
//         }
//       }
//     };
    

//     fetchProfile();
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setPersonalInfo({ ...personalInfo, [name]: value });
//   };

//   const handleSubmit = async () => {
//     if (!personalInfo.name || !personalInfo.contact || !personalInfo.location) {
//       alert('Please fill out all personal information fields.');
//       return;
//     }

//     const formData = new URLSearchParams();
//     formData.append('name', personalInfo.name);
//     formData.append('contact', personalInfo.contact);
//     formData.append('location', personalInfo.location);
//     formData.append('email', personalInfo.email);

//     try {
//       const response = await axios.put(`http://localhost:4000/api/profile/${localStorage.getItem('userId')}`, formData, {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
//         },
//       });
//       alert('Profile updated successfully!');
//       console.log('Profile data:', response.data);
//     } catch (error) {
//       console.error('Error updating profile:', error.response?.data || error.message);
//       alert('Error updating profile. Please try again.');
//     }
//   };

//   return (
//     <div className="profile-page container">
//       <div className="row">
//         {/* Sidebar */}
//         <div className="col-md-3">
//           <Sidebar />
//         </div>
//         <div className="col-md-9">
//           <h1>Profile Page</h1>
    
//           <div className="profile-container">
//             <div className="profile-section">
//               <h2>Personal Information</h2>
//               <label>
//                 Name:
//                 <input
//                   type="text"
//                   name="name"
//                   value={personalInfo.name}
//                   onChange={handleInputChange}
//                 />
//               </label>
//               <label>
//                 Contact:
//                 <input
//                   type="text"
//                   name="contact"
//                   value={personalInfo.contact}
//                   onChange={handleInputChange}
//                 />
//               </label>
//               <label>
//                 Location:
//                 <input
//                   type="text"
//                   name="location"
//                   value={personalInfo.location}
//                   onChange={handleInputChange}
//                 />
//               </label>
//               <label>
//                 Email:
//                 <input
//                   type="text"
//                   name="email"
//                   value={personalInfo.email}
//                   readOnly
//                 />
//               </label>
//               <div className="profile-section">
//                 <button onClick={handleSubmit}>
//                   Update Profile
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CandidateProfile;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CandidateProfile.css';
import Sidebar from '../components/Sidebar';

function CandidateProfile() {
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    contact: '',
    location: '',
    salary: '',
    email: '',
    password_hash: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem('userId');
      const jwtToken = localStorage.getItem('jwtToken');
    
      if (!userId || !jwtToken) {
        setError('User ID or JWT token is missing. Please log in again.');
        return;
      }
    
      try {
        const response = await axios.get(`http://localhost:4000/api/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
    
        if (response.status === 200) {
          setPersonalInfo({
            name: response.data.name || '',
            contact: response.data.contact || '',
            location: response.data.location || '',
            salary: response.data.salary || '',
            email: response.data.email || '',
            password_hash: '' // Do not populate the password field
          });
        } else {
          setError(`Error: Received unexpected status code ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
    
        if (error.response) {
          setError(`Error fetching profile: ${error.response.data.error || error.message}`);
        } else if (error.request) {
          setError('Error fetching profile: No response received from server');
        } else {
          setError(`Error fetching profile: ${error.message}`);
        }
      }
    };
    
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handleSubmit = async () => {
    if (!personalInfo.name || !personalInfo.contact || !personalInfo.location || !personalInfo.salary) {
      alert('Please fill out all personal information fields.');
      return;
    }

    const formData = new URLSearchParams();
    formData.append('name', personalInfo.name);
    formData.append('contact', personalInfo.contact);
    formData.append('location', personalInfo.location);
    formData.append('salary', personalInfo.salary);
    formData.append('email', personalInfo.email);
    if (personalInfo.password_hash) {
      formData.append('password_hash', personalInfo.password_hash); // Include password hash only if it's provided
    }

    try {
      const response = await axios.put(`http://localhost:4000/api/profile/${localStorage.getItem('userId')}`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
      });
      alert('Profile updated successfully!');
      console.log('Profile data:', response.data);
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      alert('Error updating profile. Please try again.');
    }
  };

  // Add the delete function
  const handleDelete = () => {
    alert('Data deleted.');
    setPersonalInfo({
      name: '',
      contact: '',
      location: '',
      salary: '',
      email: personalInfo.email, // Keep email since it's read-only
      password_hash: '' // Reset the password field
    });
  };

  return (
    <div className="profile-page container">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <Sidebar />
        </div>
        <div className="col-md-9">
          <h1>Profile Page</h1>
    
          <div className="profile-container">
            <div className="profile-section">
              <h2>Personal Information</h2>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={personalInfo.name}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Contact:
                <input
                  type="text"
                  name="contact"
                  value={personalInfo.contact}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Location:
                <input
                  type="text"
                  name="location"
                  value={personalInfo.location}
                  onChange={handleInputChange}
                />
              </label>
              
              <label>
                Email:
                <input
                  type="text"
                  name="email"
                  value={personalInfo.email}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Password:
                <input
                  type="password"
                  name="password_hash"
                  placeholder="Enter new password"
                  value={personalInfo.password_hash}
                  onChange={handleInputChange}
                />
              </label>
              <div className="profile-section">
                <button onClick={handleSubmit}>
                  Update Profile
                </button>
                <button onClick={handleDelete} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>
                  Delete Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;
