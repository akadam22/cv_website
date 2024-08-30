const express = require('express');
const router = express.Router();
const pool = require('../db');

// Endpoint to fetch notifications for a user
router.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const sql = `
      SELECT id, message, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.promise().query(sql, [userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'An error occurred while fetching notifications.' });
  }
});

// Endpoint to mark notifications as read
router.put('/notifications/:notificationId/read', async (req, res) => {
    const { notificationId } = req.params;
  
    try {
      const sql = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = ?
      `;
      await pool.promise().query(sql, [notificationId]);
  
      res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'An error occurred while marking notification as read.' });
    }
  });
  

module.exports = router;
