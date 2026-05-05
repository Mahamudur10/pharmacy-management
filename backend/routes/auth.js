const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'Customer',
      status: role === 'Supplier' ? 'pending' : 'approved'
    });
    await user.save();
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name, email, role: user.role, status: user.status } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found:', user.email, 'Role:', user.role);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    if (user.status === 'pending') {
      return res.status(400).json({ message: 'Account pending admin approval' });
    }
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email, 
        role: user.role,
        status: user.status
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;