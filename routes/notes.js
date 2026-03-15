const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  size: String,
  uploadedAt: { type: Date, default: Date.now },
  url: String,
});
const Note = mongoose.model('Note', noteSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/notes';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Teacher uploads note
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const note = await Note.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: (req.file.size / 1024).toFixed(1) + ' KB',
      url: `http://192.168.8.248:5000/uploads/notes/${req.file.filename}`,
    });
    res.json({ message: 'Note uploaded successfully', file: note });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get all notes
router.get('/', async (req, res) => {
  try {
    const files = await Note.find().sort({ uploadedAt: -1 });
    res.json({ files });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;