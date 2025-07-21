const jwt = require('jsonwebtoken');
const { Customer, Role } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get fresh user data
    const user = await Customer.findByPk(decoded.userId, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    if (!user || !user.enabled) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role?.roleName !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// User can only access their own data middleware
const requireOwnershipOrAdmin = (req, res, next) => {
  const userId = parseInt(req.params.id);
  
  if (req.user.role?.roleName === 'ADMIN' || req.user.id === userId) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin
};
