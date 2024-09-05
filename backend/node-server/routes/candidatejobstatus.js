const express = require('express');
const router = express.Router();
const pool = require('../db'); // Ensure this path is correct
const { sendEmailNotification } = require('./emailnotification');

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

// Update status route
router.put('/job-applications/:applicationId/status', async (req, res) => {
  console.log('PUT request received:', req.originalUrl);
  console.log('Params:', req.params);
  console.log('Body:', req.body);

  const { applicationId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const [result] = await pool.promise().query(
      'UPDATE jobapplication SET status = ? WHERE id = ?',
      [status, applicationId]
    );

    if (result.affectedRows === 0) {
      console.log(`Application with ID ${applicationId} not found.`);
      return res.status(404).json({ message: 'Application not found' });
    }

    const [updatedApplication] = await pool.promise().query(
      'SELECT * FROM jobapplication WHERE id = ?',
      [applicationId]
    );

    res.json(updatedApplication[0]);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});



module.exports = router;
