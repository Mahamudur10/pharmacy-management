const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Pharmacist', 'Supplier', 'Customer'], default: 'Customer' },
  status: { type: String, enum: ['pending', 'approved'], default: 'approved' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);