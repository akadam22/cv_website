import React from 'react';
import '../styles/OurJobs.css';
import Logo1 from '../assets/company-logo1.png'; // Import your images
import Logo2 from '../assets/company-logo2.png';
import Logo3 from '../assets/company-logo4.png';

const jobs = [
  {
    title: 'Front-End Developer',
    location: 'New York, NY',
    description: 'Build and maintain the front-end of our web applications.',
    image: Logo1 // Use the imported image
  },
  {
    title: 'Back-End Developer',
    location: 'San Francisco, CA',
    description: 'Develop and maintain server-side applications and APIs.',
    image: Logo2 // Use the imported image
  },
  {
    title: 'UI/UX Designer',
    location: 'Remote',
    description: 'Design user interfaces and user experiences for our products.',
    image: Logo3 // Use the imported image
  },
];

const OurJobs = () => {
  return (
    <div className="job-listings"><br></br><br></br>
      <h1>Open Positions</h1>
      <div className="card-container">
        {jobs.map((job, index) => (
          <div className="card" key={index}>
            <img src={job.image} alt={job.title} />
            <div className="container">
              <h2>{job.title}</h2>
              <p><strong>Location:</strong> {job.location}</p>
              <p>{job.description}</p>
              <a href="/signin" className="apply-button">Apply Now</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurJobs;
