const express = require('express');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get notifications for user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { userId: req.user.id },
        { forAll: true }
      ]
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;