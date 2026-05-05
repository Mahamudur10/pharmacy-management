const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

const isPharmacist = (req, res, next) => {
  if (req.user.role !== 'Pharmacist' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Pharmacist only.' });
  }
  next();
};

module.exports = { auth, isAdmin, isPharmacist };