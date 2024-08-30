
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Endpoint to submit feedback for a job application
router.post('/jobapplications/:applicationId/feedback', async (req, res) => {
  const { applicationId } = req.params;
  const { feedback } = req.body;

  if (!applicationId || !feedback) {
    return res.status(400).json({ error: 'Application ID and feedback are required.' });
  }

  try {
    // Insert feedback into the database
    const feedbackSql = `
      INSERT INTO feedback (application_id, feedback)
      VALUES (?, ?)
    `;
    await pool.promise().query(feedbackSql, [applicationId, feedback]);

    // Fetch candidate's user_id
    const candidateSql = `
      SELECT ja.user_id
      FROM jobapplication ja
      WHERE ja.id = ?
    `;
    const [candidateRows] = await pool.promise().query(candidateSql, [applicationId]);
    const candidateId = candidateRows[0]?.user_id;

    if (candidateId) {
      // Insert notification for the candidate
      const notificationSql = `
        INSERT INTO notifications (user_id, message)
        VALUES (?, ?)
      `;
      const message = `You have received new feedback on your job application: ${feedback}`;
      await pool.promise().query(notificationSql, [candidateId, message]);
    }

    res.status(201).json({ message: 'Feedback submitted and notification sent successfully.' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'An error occurred while submitting feedback.' });
  }
});

module.exports = router;
