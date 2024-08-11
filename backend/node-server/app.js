const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors'); // Make sure to use CORS

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  }
});

const upload = multer({ storage });

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cv_website' // Ensure this is the correct database name
});

// Endpoint to upload resume
app.post('/api/upload-resume/:userId', upload.single('resume'), (req, res) => {
  const userId = req.params.userId;
  const filePath = req.file.path.replace(/\\/g, '/'); // Normalize the path
  const uploadedAt = new Date();

  // Save file path and other info to database
  const query = 'INSERT INTO resume (user_id, file_path, uploaded_at) VALUES (?, ?, ?)';
  connection.query(query, [userId, filePath, uploadedAt], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'File uploaded successfully', filePath });
  });
});

// Endpoint to upload work experience
app.post('/api/upload-experience/:userId', (req, res) => {
  const userId = req.params.userId;
  const { job_title, company, location, start_date, end_date, description } = req.body;

  const query = 'INSERT INTO experience (user_id, job_title, company, location, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
  connection.query(query, [
    userId, 
    job_title || 'NA', 
    company || 'NA', 
    location || 'NA', 
    start_date || null, 
    end_date || null, 
    description || 'NA'
  ], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Experience uploaded successfully' });
  });
});

// Endpoint to upload education
app.post('/api/upload-education/:userId', (req, res) => {
  const userId = req.params.userId;
  const { institution, degree, field_of_study, start_date, end_date, description } = req.body;

  // SQL query to insert the education data
  const query = 'INSERT INTO education (user_id, institution, degree, field_of_study, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  connection.query(query, [
    userId, 
    institution || 'NA', 
    degree || 'NA', 
    field_of_study || 'NA', 
    start_date || null, 
    end_date || null, 
    description || 'NA'
  ], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Education uploaded successfully' });
  });
});
// Endpoint to upload skills
app.post('/api/upload-skills/:userId', (req, res) => {
  const userId = req.params.userId;
  const { skill_name, proficiency, years_of_experience, description } = req.body;

  const query = 'INSERT INTO skills (user_id, skill_name, proficiency, years_of_experience, description) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [
    userId,
    skill_name || 'NA',
    proficiency || 'NA',
    years_of_experience || 0,
    description || 'NA'
  ], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Skills uploaded successfully' });
  });
});


// Start server
app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});
