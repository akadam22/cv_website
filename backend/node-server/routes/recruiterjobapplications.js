const express = require('express');
const router = express.Router();
const pool = require('../db');

// Endpoint to fetch all job applications with related job, candidate, and resume details
router.get('/job-applications', async (req, res) => {
  try {
    const sql = `
      SELECT ja.id AS application_id, ja.status, ja.application_date,
             j.title AS job_title, j.company AS company_name,
             u.name AS candidate_name, u.email AS candidate_email,
             r.file_path AS resume_url
      FROM jobapplication ja
      INNER JOIN job j ON ja.job_id = j.id
      INNER JOIN users u ON ja.user_id = u.id AND u.role = 'candidate'
      LEFT JOIN (
        SELECT user_id, file_path
        FROM resume
        WHERE (user_id, uploaded_at) IN (
          SELECT user_id, MAX(uploaded_at)
          FROM resume
          GROUP BY user_id
        )
      ) r ON u.id = r.user_id
      ORDER BY ja.application_date DESC
    `;

    const [rows] = await pool.promise().query(sql);

    // Send the result as JSON
    res.json(rows);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ error: 'An error occurred while fetching job applications.' });
  }
});

module.exports = router;
