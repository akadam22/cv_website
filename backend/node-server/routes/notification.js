const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Middleware for JWT authentication
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Endpoint to fetch notifications for a user
router.get('/notifications/:userId', authenticateJWT, async (req, res) => {
  const { userId } = req.params;

  try {
    const sql = `
      SELECT id, message, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [notifications] = await pool.promise().query(sql, [userId]);
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Endpoint to mark a notification as read
router.put('/notifications/:notificationId/read', authenticateJWT, async (req, res) => {
  const { notificationId } = req.params;

  try {
    const sql = `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ?
    `;
    await pool.promise().query(sql, [notificationId]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ error: 'Error updating notification' });
  }
});

module.exports = router;
