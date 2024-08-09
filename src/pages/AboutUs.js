import React, { useState } from 'react';
import '../styles/AboutUs.css';
import AboutUsImage from '../assets/aboutus.jpg';
import TeamMember1 from '../assets/team-member1.jpg';
import TeamMember2 from '../assets/team-member2.jpg';
import TeamMember3 from '../assets/team-member3.jpg';

const AboutUs = () => {
  async function handleSubmit(event) {
    event.preventDefault();

    const formData = {
        name: event.target.name.value,
        email: event.target.email.value,
        message: event.target.message.value
    };

    try {
        const response = await fetch('http://localhost:5000/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        console.log('Success:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}


  return (
    <div className="about-us">
      <div className="hero-section">
        <div className="hero-image-wrapper">
          <img src={AboutUsImage} alt="About Us" className="hero-image" />
          <div className="hero-content">
            <h1>About Us</h1>
            <p>Discover who we are and what drives us.</p>
            <a href="/jobs" className="cta-button">Get To Know More..</a>
          </div>
        </div>
      </div>

      <section className="mission-statement">
        <h2>Mission</h2>
        <p>My mission is to streamline the recruitment process by providing an intuitive and efficient Application Tracking System (ATS) that simplifies candidate management and improves hiring outcomes. Developed as part of a Master's project in Computer Science at the University of Greenwich, this website leverages cutting-edge technologies to offer a user-friendly interface, robust functionality, and seamless integration. We are dedicated to delivering exceptional service, fostering meaningful connections between employers and candidates, and continuously enhancing our system to meet evolving industry needs.</p>
      </section>

      <section className="company-history">
        <h2>Story</h2>
        <p>Currently studying for a Master's in Computer Science at the University of Greenwich. Doing a dissertation on <strong> Intelligent CV Filtering System for Enhanced Candidate Screening  </strong>.</p>
        <p><strong>Tools and Technologies used to create this project:</strong></p>
        <ul>
          <li>React</li>
          <li>Python</li>
          <li>HTML</li>
          <li>CSS</li>
          <li>Node.js</li>
          <li>MySQL</li>
          <li>Next.js</li>
        </ul>
      </section>

      <section className="core-values">
        <h2>Core Values</h2>
        <ul>
          <li><strong>Value 1:</strong> Making the website user-friendly.</li>
          <li><strong>Value 2:</strong> Helpful.</li>
          <li><strong>Value 3:</strong> Attractive.</li>
        </ul>
      </section>

      <section className="team-section">
        <h2>Meet the Team</h2>
        <div className="team-member">
          <img src={TeamMember1} alt="Team Member 1" />
          <div>
            <h3>Anushka Kadam</h3>
            <p>Developer/ Student</p>
          </div>
        </div>
        <div className="team-member">
          <img src={TeamMember2} alt="Team Member 2" />
          <div>
            <h3>Catherine Tonry</h3>
            <p>Supervisor</p>
          </div>
        </div>
        <div className="team-member">
          <img src={TeamMember3} alt="Team Member 3" />
          <div>
            <h3>XXXXX</h3>
            <p>Second Marker</p>
          </div>
        </div>
      </section>

      <section className="contact-info">
        <h2>Get In Touch</h2>
        <p>If you have any questions or would like to learn more about us, feel free to contact us.</p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input name="name" placeholder="Your Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea name="message" placeholder="Your Message" required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>
    </div>
  );
}

export default AboutUs;
