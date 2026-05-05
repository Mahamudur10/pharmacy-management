const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Medicine = require('./models/Medicine');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/users', require('./routes/users'));
app.use('/api/sales', require('./routes/sales'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Pharmacy Management System API is running!' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully!');
    
    // ========== CREATE DEFAULT ADMIN USER ==========
    try {
      const existingAdmin = await User.findOne({ email: 'admin@pharmacy.com' });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
          name: 'Super Admin',
          email: 'admin@pharmacy.com',
          password: hashedPassword,
          role: 'Admin',
          status: 'approved'
        });
        await admin.save();
        console.log('✅ Default Admin Created!');
        console.log('   Email: admin@pharmacy.com');
        console.log('   Password: admin123');
      } else {
        console.log('ℹ️ Admin already exists');
      }
      
      // Create demo pharmacist
      const existingPharmacist = await User.findOne({ email: 'pharmacist@pharmacy.com' });
      if (!existingPharmacist) {
        const hashedPassword = await bcrypt.hash('pharm123', 10);
        const pharmacist = new User({
          name: 'Demo Pharmacist',
          email: 'pharmacist@pharmacy.com',
          password: hashedPassword,
          role: 'Pharmacist',
          status: 'approved'
        });
        await pharmacist.save();
        console.log('✅ Demo Pharmacist Created!');
      }
      
      // Create demo supplier
      const existingSupplier = await User.findOne({ email: 'supplier@pharmacy.com' });
      if (!existingSupplier) {
        const hashedPassword = await bcrypt.hash('supplier123', 10);
        const supplier = new User({
          name: 'Demo Supplier',
          email: 'supplier@pharmacy.com',
          password: hashedPassword,
          role: 'Supplier',
          status: 'approved'
        });
        await supplier.save();
        console.log('✅ Demo Supplier Created!');
      }
      
      // Create demo customer
      const existingCustomer = await User.findOne({ email: 'customer@pharmacy.com' });
      if (!existingCustomer) {
        const hashedPassword = await bcrypt.hash('customer123', 10);
        const customer = new User({
          name: 'Demo Customer',
          email: 'customer@pharmacy.com',
          password: hashedPassword,
          role: 'Customer',
          status: 'approved'
        });
        await customer.save();
        console.log('✅ Demo Customer Created!');
      }
      
      // Check if medicines exist
      const medicineCount = await Medicine.countDocuments();
      if (medicineCount === 0) {
        console.log('ℹ️ No medicines found in database');
      } else {
        console.log(`📊 Total medicines: ${medicineCount}`);
      }
      
    } catch (error) {
      console.error('❌ Error creating demo users:', error.message);
    }
    // ================================================
    
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
});