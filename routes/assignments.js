const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');

// Submission model
const submissionSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  size: String,
  studentName: String,
  studentEmail: String,
  uploadedAt: { type: Date, default: Date.now },
  url: String,
});
const Submission = mongoose.model('Submission', submissionSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/assignments';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Student uploads assignment
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const submission = await Submission.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: (req.file.size / 1024).toFixed(1) + ' KB',
      studentName: req.body.studentName || 'Student',
      studentEmail: req.body.studentEmail || '',
      url: `http://192.168.8.248:5000/uploads/assignments/${req.file.filename}`,
    });
    res.json({ message: 'Uploaded successfully', file: submission });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Teacher gets all submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ uploadedAt: -1 });
    res.json({ submissions });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete submission
router.delete('/:id', async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;