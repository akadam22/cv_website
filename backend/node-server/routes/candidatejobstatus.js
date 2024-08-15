// Add this to your routes file or a new route file
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Adjust the path as necessary

// Get job applications for a specific user
router.get('/job-applications/:userId', async (req, res) => {
  const userId = req.params.userId;
  
  try {
    const [rows] = await pool.promise().query(`
      SELECT job.title, job.company, jobapplication.status
      FROM jobapplication
      JOIN job ON jobapplication.job_id = job.id
      WHERE jobapplication.user_id = ?
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ error: 'An error occurred while fetching job applications.' });
  }
});

// // Add an endpoint for fetching scheduled interviews
// router.get('/api/scheduled-interviews/:userId', async (req, res) => {
//   const userId = req.params.userId;

//   try {
//     const [rows] = await pool.promise().query(`
//       SELECT job.title, interview.date, interview.time, interview.location
//       FROM interview
//       JOIN job ON interview.job_id = job.id
//       WHERE interview.user_id = ?
//     `, [userId]);

//     res.json(rows);
//   } catch (error) {
//     console.error('Error fetching scheduled interviews:', error);
//     res.status(500).json({ error: 'An error occurred while fetching scheduled interviews.' });
//   }
// });

module.exports = router;
