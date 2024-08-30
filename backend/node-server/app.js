require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const port = 4000;
const app = express();
const jobRoutes = require('./routes/jobs'); // Import job routes
const pool = require('./db');
const StatusRoute = require('./routes/candidatejobstatus');
const RecJobApplication = require('./routes/recruiterjobapplications');
const jobMatching = require('./routes/jobmatching');
const scheduleInterview = require('./routes/candidatescheduleinterview');

const corsOptions = {
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};


// Initialize MySQL connection
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'cv_website',
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to the database');
});


// Middleware
app.use(cors());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: async (req, file, cb) => {
    try {
      const userId = req.params.userId;
      const [userRows] = await pool.promise().query('SELECT name FROM users WHERE id = ?', [userId]);

      if (userRows.length === 0) {
        return cb(new Error('User not found'), false);
      }

      const name = userRows[0].name;
      const extension = path.extname(file.originalname);
      const newFilename = `${name}_Resume${extension}`;

      cb(null, newFilename);
    } catch (error) {
      console.error('Error fetching username:', error);
      cb(error, false);
    }
  }
});

const upload = multer({ storage });

function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Endpoint to upload or update resume
app.post('/api/upload-resume/:userId', upload.single('resume'), async (req, res) => {
  const userId = req.params.userId;
  const filePath = req.file.path.replace(/\\/g, '/');
  const uploadedAt = new Date();

  try {
    const [userRows] = await pool.promise().query('SELECT id FROM users WHERE id = ?', [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [rows] = await pool.promise().query('SELECT file_path FROM resume WHERE user_id = ?', [userId]);

    if (rows.length > 0) {
      await pool.promise().query('UPDATE resume SET file_path = ?, uploaded_at = ? WHERE user_id = ?', [filePath, uploadedAt, userId]);
      res.status(200).json({ message: 'Resume updated successfully', filePath });
    } else {
      await pool.promise().query('INSERT INTO resume (user_id, file_path, uploaded_at) VALUES (?, ?, ?)', [userId, filePath, uploadedAt]);
      res.status(200).json({ message: 'Resume uploaded successfully', filePath });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Endpoint to upload work experience
app.post('/api/upload-experience/:userId', (req, res) => {
  const userId = req.params.userId;
  const { job_title, company, location, start_date, end_date, description } = req.body;

  const query = 'INSERT INTO experience (user_id, job_title, company, location, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
  pool.query(query, [
    userId, 
    job_title || 'NA', 
    company || 'NA', 
    location || 'NA', 
    start_date || null, 
    end_date || null, 
    description || 'NA'
  ], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Experience uploaded successfully' });
  });
});

// Endpoint to upload education
app.post('/api/upload-education/:userId', (req, res) => {
  const userId = req.params.userId;
  const { institution, degree, field_of_study, start_date, end_date, description } = req.body;

  const query = 'INSERT INTO education (user_id, institution, degree, field_of_study, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  pool.query(query, [
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
  pool.query(query, [
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

app.get('/api/profile/:user_id', authenticateJWT, (req, res) => {
  const { user_id } = req.params;
  const currentUser = req.user;

  if (parseInt(user_id) !== currentUser.user_id && currentUser.role !== 'admin') {
    console.error('Unauthorized access attempt:', {
      requestedUserId: user_id,
      currentUserId: currentUser.user_id,
      userRole: currentUser.role
    });
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  pool.query('SELECT name, contact, location, email FROM users WHERE id = ?', [user_id], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

// Endpoint to fetch education data
app.get('/api/education/:userId', authenticateJWT, (req, res) => {
  const userId = req.params.userId;

  pool.query('SELECT * FROM education WHERE user_id = ?', [userId], (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// Use routes
app.use('/api', jobRoutes);
app.use('/api', StatusRoute);
app.use('/api', RecJobApplication);
app.use('/api', jobMatching);
app.use('/api', scheduleInterview);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
