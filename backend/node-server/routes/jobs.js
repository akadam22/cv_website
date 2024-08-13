// routes/jobs.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Adjust the path according to your project structure

// Get jobs with optional filters
router.get('/jobs', async (req, res) => {
  try {
    const { title, location, company } = req.query;

    let sql = 'SELECT * FROM job WHERE 1=1';
    const params = [];

    if (title) {
      sql += ' AND title LIKE ?';
      params.push(`%${title}%`);
    }
    if (location) {
      sql += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }
    if (company) {
      sql += ' AND company LIKE ?';
      params.push(`%${company}%`);
    }

    const [rows] = await pool.promise().query(sql, params);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'An error occurred while fetching jobs.' });
  }
});

module.exports = router;
