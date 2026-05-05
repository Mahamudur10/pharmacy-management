const express = require('express');
const Medicine = require('../models/Medicine');
const router = express.Router();

// Get all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    console.log('Fetched medicines:', medicines.length); // Debug log
    res.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add medicine
router.post('/', async (req, res) => {
  try {
    console.log('Adding medicine:', req.body);
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    console.error('Error adding medicine:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update medicine
router.put('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete medicine
router.delete('/:id', async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;