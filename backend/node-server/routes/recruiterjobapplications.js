const express = require('express');
const router = express.Router();
const pool = require('../db');

// Updated query to include candidate resume URL from the resume table
router.get('/jobs', async (req, res) => {
  try {
    const { title, company } = req.query;

    let sql = `
      SELECT j.id AS job_id, j.title AS job_title, j.company AS company_name,
             ja.id AS application_id, ja.status,
             u.id AS candidate_id, u.name AS candidate_name, u.email AS candidate_email,
             r.file_path AS resume_url
      FROM job j
      INNER JOIN jobapplication ja ON j.id = ja.job_id
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
      WHERE j.title LIKE ? AND j.company LIKE ?
    `;
    
    const params = [`%${title}%`, `%${company}%`];

    console.log('Executing SQL:', sql); // Log the SQL query
    console.log('Query Params:', params); // Log the query parameters

    const [rows] = await pool.promise().query(sql, params);

    console.log('Fetched Data:', rows); // Log the fetched data for debugging

    // Structure the response to include the job and candidates
    const jobs = rows.reduce((acc, row) => {
      let job = acc.find(job => job.job_id === row.job_id);
      if (!job) {
        job = {
          job_id: row.job_id,
          job_title: row.job_title,
          company_name: row.company_name,
          candidates: []
        };
        acc.push(job);
      }
      job.candidates.push({
        application_id: row.application_id,
        status: row.status,
        candidate_id: row.candidate_id,
        candidate_name: row.candidate_name,
        candidate_email: row.candidate_email,
        resume_url: row.resume_url ? `http://localhost:4000/uploads/${row.resume_url}` : null // Construct URL
      });
      return acc;
    }, []);

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'An error occurred while fetching jobs.' });
  }
});

module.exports = router;
