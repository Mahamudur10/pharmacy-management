const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  invoiceNo: { type: String, unique: true },
  customerName: { type: String, default: 'Walk-in Customer' },
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Cash' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', SaleSchema);