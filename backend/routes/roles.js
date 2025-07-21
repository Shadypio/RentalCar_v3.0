const express = require('express');
const { Role } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all roles (authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['roleName', 'ASC']]
    });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get role by ID (authenticated users)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
