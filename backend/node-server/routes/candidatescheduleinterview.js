const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

const router = express.Router(); // Use Router instead of creating a new app

// CORS options
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials to be included
};

// Apply middleware
router.use(cors(corsOptions));
router.use(express.json()); // Built-in middleware to parse JSON bodies

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

// Middleware for JWT authentication
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Define routes
router.get('/api/jobs', (req, res) => {
  connection.query('SELECT * FROM jobapplication', (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error fetching jobs' });
    }
    res.json(results);
  });
});

router.get('/api/candidates', (req, res) => {
  connection.query('SELECT * FROM users WHERE role = "candidate"', (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error fetching candidates' });
    }
    res.json(results);
  });
});

module.exports = router;
