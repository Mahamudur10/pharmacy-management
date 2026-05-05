const express = require('express');
const Sale = require('../models/Sale');
const router = express.Router();

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create sale
router.post('/', async (req, res) => {
  try {
    const sale = new Sale(req.body);
    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;