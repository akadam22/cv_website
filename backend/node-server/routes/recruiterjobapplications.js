const express = require('express');
const router = express.Router();
const pool = require('../db');

// Updated query to include candidate resume URL from the resume table
router.get('/jobs', async (req, res) => {
  try {
    const { title, location, company } = req.query;

    let sql = `
      SELECT j.id AS job_id, j.title AS job_title, j.company AS company_name,
             ja.id AS application_id, ja.status,
             u.id AS candidate_id, u.name AS candidate_name, u.email AS candidate_email,
             r.file_path AS resume_url
      FROM job j
      LEFT JOIN jobapplication ja ON j.id = ja.job_id
      LEFT JOIN users u ON ja.user_id = u.id AND u.role = 'candidate'
      LEFT JOIN (
        SELECT user_id, file_path
        FROM resume
        WHERE (user_id, uploaded_at) IN (
          SELECT user_id, MAX(uploaded_at)
          FROM resume
          GROUP BY user_id
        )
      ) r ON ja.user_id = r.user_id
      WHERE 1=1
    `;
    const params = [];

    if (title) {
      sql += ' AND j.title LIKE ?';
      params.push(`%${title}%`);
    }
    if (location) {
      sql += ' AND j.location LIKE ?';
      params.push(`%${location}%`);
    }
    if (company) {
      sql += ' AND j.company LIKE ?';
      params.push(`%${company}%`);
    }

    sql += ' ORDER BY j.id ASC';

    console.log('Executing SQL:', sql); // Log the SQL query
    console.log('Query Params:', params); // Log the query parameters

    const [rows] = await pool.promise().query(sql, params);

    console.log('Fetched Data:', rows); // Log the fetched data for debugging

    // Group results by job
    const jobs = rows.reduce((acc, row) => {
      const jobId = row.job_id;

      if (!acc[jobId]) {
        acc[jobId] = {
          id: jobId,
          title: row.job_title,
          company: row.company_name,
          candidates: []
        };
      }

      if (row.application_id) {
        acc[jobId].candidates.push({
          application_id: row.application_id,
          status: row.status,
          candidate_id: row.candidate_id,
          candidate_name: row.candidate_name,
          candidate_email: row.candidate_email,
          resume_url: row.resume_url ? `http://localhost:4000/uploads/${row.resume_url}` : null // Construct URL
        });
      }

      return acc;
    }, {});

    res.json(Object.values(jobs));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'An error occurred while fetching jobs.' });
  }
});

module.exports = router;