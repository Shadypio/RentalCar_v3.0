const express = require('express');
const { body, validationResult } = require('express-validator');
const { Car } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all cars (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cars = await Car.findAll({
      order: [['brand', 'ASC'], ['model', 'ASC']]
    });
    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get car by ID (protected route)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.json(car);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new car (admin only)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('licensePlate').notEmpty().withMessage('License plate is required'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('category').isIn(['Automobile', 'Commerciale', 'Camper']).withMessage('Valid category is required'),
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

    const { licensePlate, brand, model, year, category } = req.body;

    // Check if license plate already exists
    const existingCar = await Car.findOne({ where: { licensePlate } });
    if (existingCar) {
      return res.status(400).json({ message: 'License plate already exists' });
    }

    const newCar = await Car.create({
      licensePlate,
      brand,
      model,
      year: parseInt(year),
      category
    });

    res.status(201).json(newCar);
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update car (admin only)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('licensePlate').optional().notEmpty().withMessage('License plate cannot be empty'),
  body('brand').optional().notEmpty().withMessage('Brand cannot be empty'),
  body('model').optional().notEmpty().withMessage('Model cannot be empty'),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('category').optional().isIn(['Automobile', 'Commerciale', 'Camper']).withMessage('Valid category is required'),
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

    const car = await Car.findByPk(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if license plate already exists (excluding current car)
    if (req.body.licensePlate && req.body.licensePlate !== car.licensePlate) {
      const existingCar = await Car.findOne({ 
        where: { licensePlate: req.body.licensePlate }
      });
      if (existingCar) {
        return res.status(400).json({ message: 'License plate already exists' });
      }
    }

    await car.update(req.body);
    res.json(car);
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete car (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    await car.destroy();
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
