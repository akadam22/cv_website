
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Adjust the path according to your project structure
const sendEmail = require('../utils/email');

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

//Apply for jobs 
router.post('/jobs/:jobId/apply', async (req, res) => {
    const { jobId } = req.params;
    const { userId } = req.body;
  
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
  
    try {
      // Fetch resume ID for the user
      const [resumeRows] = await pool.promise().query('SELECT id FROM resume WHERE user_id = ?', [userId]);
  
      if (resumeRows.length === 0) {
        return res.status(400).json({ error: 'You must upload a resume before applying for a job.' });
      }
      
      const resumeId = resumeRows[0].id;
  
      // Insert the job application with the retrieved resume ID
      const sql = 'INSERT INTO jobapplication (job_id, user_id, resume_id, status) VALUES (?, ?, ?, ?)';
      const params = [jobId, userId, resumeId, 'Received'];
      
      await pool.promise().query(sql, params);
  
      // Fetch job details
      const [jobRows] = await pool.promise().query('SELECT * FROM job WHERE id = ?', [jobId]);
      const job = jobRows[0];
      
      // Fetch user details
      const [userRows] = await pool.promise().query('SELECT email FROM users WHERE id = ?', [userId]);
      const user = userRows[0];
  
    //   // Send email notification to the user
    //   const subject = `Application Received for ${job.title}`;
    //   const text = `
    //     Hello,
  
    //     You have successfully applied for the job titled "${job.title}" at "${job.company}".
  
    //     Job Description:
    //     ${job.description}
  
    //     Application Status: Received
  
    //     We will let you know about further details.
  
    //     Best regards,
    //     Your Company
    //   `;
  
    //   await sendEmail(user.email, subject, text);
      
      res.status(200).json({ message: 'Application submitted successfully' });
    } catch (error) {
      console.error('Error applying for job:', error);
      res.status(500).json({ error: 'An error occurred while applying for the job.' });
    }
  });
  
  

module.exports = router;
