const express = require('express');
const { body, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const { Customer, Role, Rental } = require('../models');
const { authenticateToken, requireAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all customers (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [{
        model: Role,
        as: 'role'
      }],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });
    
    // Remove password from response
    const customersWithoutPassword = customers.map(customer => {
      const { password, ...customerData } = customer.toJSON();
      return customerData;
    });
    
    res.json(customersWithoutPassword);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get customer by ID (owner or admin only)
router.get('/:id', authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Remove password from response
    const { password, ...customerData } = customer.toJSON();
    res.json(customerData);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get customer by username (admin only)
router.get('/username/:username', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { username: req.params.username },
      include: [{
        model: Role,
        as: 'role'
      }]
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Remove password from response
    const { password, ...customerData } = customer.toJSON();
    res.json(customerData);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new customer (admin only)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('roleId').isInt().withMessage('Valid role ID is required'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, password, firstName, lastName, dateOfBirth, roleId } = req.body;

    // Check if username already exists
    const existingCustomer = await Customer.findOne({ where: { username } });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Verify role exists
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Invalid role ID' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    const newCustomer = await Customer.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      dateOfBirth,
      enabled: true,
      roleId
    });

    // Fetch customer with role
    const customerWithRole = await Customer.findByPk(newCustomer.id, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    // Remove password from response
    const { password: _, ...customerData } = customerWithRole.toJSON();
    res.status(201).json(customerData);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update customer (owner or admin only)
router.put('/:id', [
  authenticateToken,
  requireOwnershipOrAdmin,
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if username already exists (excluding current customer)
    if (req.body.username && req.body.username !== customer.username) {
      const existingCustomer = await Customer.findOne({ 
        where: { username: req.body.username }
      });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    // Only admin can change role
    if (req.body.roleId && req.user.role?.roleName !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admin can change user roles' });
    }

    await customer.update(req.body);
    
    // Fetch updated customer with role
    const updatedCustomer = await Customer.findByPk(customer.id, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    // Remove password from response
    const { password, ...customerData } = updatedCustomer.toJSON();
    res.json(customerData);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete customer (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await customer.destroy();
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
