const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  batchNumber: { type: String },
  manufacturer: { type: String },
  supplier: { type: String },
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  manufactureDate: { type: String },
  expiryDate: { type: String },
  discount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Check if model already exists to avoid overwriting
module.exports = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);