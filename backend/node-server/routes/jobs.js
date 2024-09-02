const express = require('express');
const router = express.Router();
const pool = require('../db'); 

//candidate applying manually
// Get jobs with optional filters
router.get('/jobs', async (req, res) => {
  try {
    const { title, location, company } = req.query;

    let sql = 'SELECT * FROM job WHERE 1=1';
    const params = [];

    if (title) {
      sql += ' AND title LIKE ?';
      params.push(`%${title.trim()}%`);
    }
    if (location) {
      sql += ' AND location LIKE ?';
      params.push(`%${location.trim()}%`);
    }
    if (company) {
      sql += ' AND company LIKE ?';
      params.push(`%${company.trim()}%`);
    }

    const [rows] = await pool.promise().query(sql, params);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'An error occurred while fetching jobs.' });
  }
});

// Fetch distinct locations from the job table
router.get('/locations', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT DISTINCT location FROM job WHERE location IS NOT NULL AND location <> ""');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'An error occurred while fetching locations.' });
  }
});

//Apply for jobs 
router.post('/jobs/:jobId/apply', async (req, res) => {
  const { jobId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Check if the user has already applied for this job
    const [existingApplications] = await pool.promise().query(
      'SELECT * FROM jobapplication WHERE job_id = ? AND user_id = ?',
      [jobId.trim(), userId.trim()]
    );

    // Debugging log
    console.log(`Existing applications: ${JSON.stringify(existingApplications)}`);

    if (existingApplications.length > 0) {
      // If application exists, return a message indicating the job has already been applied for
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    // Fetch resume ID for the user
    const [resumeRows] = await pool.promise().query('SELECT id FROM resume WHERE user_id = ?', [userId.trim()]);

    if (resumeRows.length === 0) {
      return res.status(400).json({ error: 'You must upload a resume before applying for a job.' });
    }

    const resumeId = resumeRows[0].id;

    // Insert the job application with the retrieved resume ID
    const sql = 'INSERT INTO jobapplication (job_id, user_id, resume_id, status) VALUES (?, ?, ?, ?)';
    const params = [jobId.trim(), userId.trim(), resumeId, 'Applied'];

    await pool.promise().query(sql, params);

    // Fetch job details
    const [jobRows] = await pool.promise().query('SELECT * FROM job WHERE id = ?', [jobId.trim()]);
    const job = jobRows[0];

    // Fetch user details
    const [userRows] = await pool.promise().query('SELECT email, name FROM users WHERE id = ?', [userId.trim()]);
    const user = userRows[0];

    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ error: 'An error occurred while applying for the job.' });
  }
});

module.exports = router;
