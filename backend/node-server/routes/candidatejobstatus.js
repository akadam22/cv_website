const express = require('express');
const router = express.Router();
const pool = require('../db'); // Ensure this path is correct

// Endpoint to fetch job applications for a specific user
router.get('/candidate-applications/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log(`Fetching applications for userId: ${userId}`);
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    // Fetch job applications
    const [applications] = await pool.promise().query('SELECT job_id, status FROM jobapplication WHERE user_id = ?', [userId]);

    if (applications.length === 0) {
      return res.status(404).json({ error: 'No job applications found for this user.' });
    }

    // Fetch job details for each application
    const jobIds = [...new Set(applications.map(app => app.job_id))]; // Unique job IDs
    const [jobs] = await pool.promise().query('SELECT id, title, company FROM job WHERE id IN (?)', [jobIds]);

    const jobsMap = new Map(jobs.map(job => [job.id, job]));
    const applicationsWithDetails = applications.map(app => ({
      jobTitle: jobsMap.get(app.job_id)?.title || 'Unknown',
      company: jobsMap.get(app.job_id)?.company || 'Unknown',
      status: app.status
    }));

    res.json(applicationsWithDetails);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ error: 'An error occurred while fetching job applications.' });
  }
});

module.exports = router;
