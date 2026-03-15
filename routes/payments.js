const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

const paymentSchema = new mongoose.Schema({
  studentEmail: String,
  studentName: String,
  amount: String,
  month: String,
  filename: String,
  url: String,
  status: { type: String, default: 'pending' }, // pending, approved, rejected
  createdAt: { type: Date, default: Date.now },
});
const Payment = mongoose.model('Payment', paymentSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/payments';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Student uploads payment receipt
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const payment = await Payment.create({
      studentEmail: req.body.studentEmail,
      studentName: req.body.studentName,
      amount: req.body.amount || 'LKR 2,500',
      month: req.body.month,
      filename: req.file.filename,
      url: `http://192.168.8.248:5000/uploads/payments/${req.file.filename}`,
      status: 'pending',
    });
    res.json({ message: 'Receipt uploaded', payment });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get payments for a student
router.get('/student/:email', async (req, res) => {
  try {
    const payments = await Payment.find({
      studentEmail: req.params.email
    }).sort({ createdAt: -1 });
    res.json({ payments });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get all payments (teacher)
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json({ payments });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Teacher approves/rejects payment
router.put('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ message: 'Updated', payment });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;