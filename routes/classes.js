const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: String,
  date: String,
  time: String,
  duration: String,
  link: String,
  topic: String,
  status: { type: String, default: 'upcoming' },
  createdAt: { type: Date, default: Date.now },
});
const Class = mongoose.model('Class', classSchema);

// Create class (teacher)
router.post('/', async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.json({ message: 'Class created', class: cls });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().sort({ date: 1 });
    res.json({ classes });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete class
router.delete('/:id', async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;