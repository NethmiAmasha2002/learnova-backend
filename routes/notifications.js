const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: String,
  body: String,
  type: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);

// Teacher creates notification
router.post('/', async (req, res) => {
  try {
    const notif = await Notification.create(req.body);
    res.json({ message: 'Notification created', data: notif });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;