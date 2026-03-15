const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  studentEmail: String,
  studentName: String,
  text: String,
  from: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Send message
router.post('/', async (req, res) => {
  try {
    const msg = await Message.create(req.body);
    res.json({ message: 'Sent', data: msg });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get messages for a student
router.get('/:studentEmail', async (req, res) => {
  try {
    const messages = await Message.find({
      studentEmail: req.params.studentEmail
    }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get all students who have messages (for teacher)
router.get('/', async (req, res) => {
  try {
    const students = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: '$studentEmail',
        studentName: { $first: '$studentName' },
        lastMessage: { $first: '$text' },
        lastTime: { $first: '$createdAt' },
        unread: { $sum: { $cond: [{ $eq: ['$from', 'student'] }, 1, 0] } }
      }}
    ]);
    res.json({ students });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;