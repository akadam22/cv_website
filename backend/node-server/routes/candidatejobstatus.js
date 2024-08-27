const express = require('express');
const router = express.Router();
const pool = require('../db'); // Adjust the path as necessary

// Update the status of a job application
router.put('/job-applications/:applicationId/status', async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  // Validate status (optional)
  const validStatuses = ['Received', 'Under Review', 'Interview Scheduled', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const [result] = await pool.promise().query(`
      UPDATE jobapplication
      SET status = ?
      WHERE id = ?
    `, [status, applicationId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Status updated successfully' });
    } else {
      res.status(404).json({ error: 'Job application not found' });
    }
  } catch (error) {
    console.error('Error updating job application status:', error);
    res.status(500).json({ error: 'An error occurred while updating job application status.' });
  }
});

module.exports = router;


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
