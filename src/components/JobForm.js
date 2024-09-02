import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/JobForm.css';

function JobForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [companyError, setCompanyError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [salaryError, setSalaryError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/jobs/${id}`)
        .then(response => {
          const job = response.data;
          setTitle(job.title);
          setDescription(job.description);
          setCompany(job.company);
          setLocation(job.location);
          setSalary(job.salary);
        })
        .catch(error => {
          setError('Error fetching job details.');
          console.error('Error fetching job:', error);
        });
    }
  }, [id]);

  const validateTitle = (title) => {
    if (title.length < 3) {
      setTitleError('Title must be at least 3 characters long.');
      return false;
    } else {
      setTitleError('');
      return true;
    }
  };

  const validateDescription = (description) => {
    if (description.length < 10) {
      setDescriptionError('Description must be at least 10 characters long.');
      return false;
    } else {
      setDescriptionError('');
      return true;
    }
  };

  const validateCompany = (company) => {
    if (company.length < 2) {
      setCompanyError('Company name must be at least 2 characters long.');
      return false;
    } else {
      setCompanyError('');
      return true;
    }
  };

  const validateLocation = (location) => {
    if (location.length < 2) {
      setLocationError('Location must be at least 2 characters long.');
      return false;
    } else {
      setLocationError('');
      return true;
    }
  };

  const validateSalary = (salary) => {
    const parsedSalary = parseInt(salary, 10);
    if (isNaN(parsedSalary) || parsedSalary <= 0) {
      setSalaryError('Please enter a valid salary.');
      return false;
    } else {
      setSalaryError('');
      return true;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Trim inputs before validation
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedCompany = company.trim();
    const trimmedLocation = location.trim();
    const trimmedSalary = salary.trim();

    const isTitleValid = validateTitle(trimmedTitle);
    const isDescriptionValid = validateDescription(trimmedDescription);
    const isCompanyValid = validateCompany(trimmedCompany);
    const isLocationValid = validateLocation(trimmedLocation);
    const isSalaryValid = validateSalary(trimmedSalary);

    if (!isTitleValid || !isDescriptionValid || !isCompanyValid || !isLocationValid || !isSalaryValid) {
      setError('Please fix the errors in the form.');
      return;
    }

    const parsedSalary = parseInt(trimmedSalary, 10);
    const job = { title: trimmedTitle, description: trimmedDescription, company: trimmedCompany, location: trimmedLocation, salary: parsedSalary };

    const token = localStorage.getItem('access_token');
    console.log('Access Token:', token); // Log the access token

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (id) {
      // Update existing job
      axios.put(`http://localhost:5000/api/jobs/${id}`, job, config)
        .then(response => {
          alert('Job updated successfully!');
          navigate('/recruiter/jobs');
        })
        .catch(error => {
          alert('Error updating job: ' + error.message);
          console.error('Error updating job:', error);
        });
    } else {
      // Create new job
      axios.post('http://localhost:5000/api/jobs', job, config)
        .then(response => {
          alert('Job created successfully!');
          navigate('/recruiter/jobs');
        })
        .catch(error => {
          alert('Error creating job: ' + error.message);
          console.error('Error creating job:', error);
        });
    }
  };

  return (
    <div>
      <div className="sidebar">
        <br />
        <br />
        <br />
        <h2>Recruiter Dashboard</h2>
        <ul>
          <li><Link to="/recruiter">Home</Link></li>
          <li><Link to="/recruiter/jobs">Jobs</Link></li>
          <li><Link to="/recruiter/candidates">Candidates</Link></li>
          <li><Link to="/recruiter/interview">Schedule Interview</Link></li>
          <li><button className="logout-button" onClick={() => window.location.href = '/signin'}>Logout</button></li>
        </ul>
      </div>
      <div className="job-form-container">
        <br /><br /><br />
        <div className="job-form">
          <h2>{id ? 'Edit Job' : 'Post a New Job'}</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="title">
              Title:
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => validateTitle(title.trim())}
                required
                autoComplete="job-title"
              />
              {titleError && <p className="error-message">{titleError}</p>}
            </label>
            <label htmlFor="description">
              Description:
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => validateDescription(description.trim())}
                required
                autoComplete="job-description"
              />
              {descriptionError && <p className="error-message">{descriptionError}</p>}
            </label>
            <label htmlFor="company">
              Company:
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onBlur={() => validateCompany(company.trim())}
                required
                autoComplete="company-name"
              />
              {companyError && <p className="error-message">{companyError}</p>}
            </label>
            <label htmlFor="location">
              Location:
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={() => validateLocation(location.trim())}
                required
                autoComplete="job-location"
              />
              {locationError && <p className="error-message">{locationError}</p>}
            </label>
            <label htmlFor="salary">
              Salary:
              <input
                id="salary"
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                onBlur={() => validateSalary(salary.trim())}
                required
                autoComplete="job-salary"
              />
              {salaryError && <p className="error-message">{salaryError}</p>}
            </label>
            <button type="submit">{id ? 'Update Job' : 'Post Job'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JobForm;
