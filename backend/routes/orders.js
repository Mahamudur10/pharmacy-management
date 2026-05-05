const express = require('express');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get orders for supplier
router.get('/', auth, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'Supplier') {
      orders = await Order.find({ supplierId: req.user.id });
    } else if (req.user.role === 'Admin') {
      orders = await Order.find();
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;