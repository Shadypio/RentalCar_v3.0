const express = require('express');
const { body, validationResult } = require('express-validator');
const { Rental, Customer, Car, Role } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all rentals (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rentals = await Rental.findAll({
      include: [
        {
          model: Customer,
          as: 'referredCustomer',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: Car,
          as: 'rentedCar',
          attributes: ['id', 'licensePlate', 'brand', 'model', 'year', 'category']
        }
      ],
      order: [['startDate', 'DESC']]
    });
    
    res.json(rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get rental by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rental = await Rental.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'referredCustomer',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: Car,
          as: 'rentedCar',
          attributes: ['id', 'licensePlate', 'brand', 'model', 'year', 'category']
        }
      ]
    });
    
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    
    res.json(rental);
  } catch (error) {
    console.error('Error fetching rental:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get rentals by customer ID (user can see own rentals, admin can see any)
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    
    // Check if user can access this data
    if (req.user.role?.roleName !== 'ADMIN' && req.user.id !== customerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const rentals = await Rental.findAll({
      where: { customerId },
      include: [
        {
          model: Customer,
          as: 'referredCustomer',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: Car,
          as: 'rentedCar',
          attributes: ['id', 'licensePlate', 'brand', 'model', 'year', 'category']
        }
      ],
      order: [['startDate', 'DESC']]
    });
    
    res.json(rentals);
  } catch (error) {
    console.error('Error fetching customer rentals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new rental (authenticated users)
router.post('/', [
  authenticateToken,
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('customerId').isInt().withMessage('Valid customer ID is required'),
  body('carId').isInt().withMessage('Valid car ID is required'),
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

    const { startDate, endDate, customerId, carId } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Check if user can create rental for this customer
    if (req.user.role?.roleName !== 'ADMIN' && req.user.id !== customerId) {
      return res.status(403).json({ message: 'You can only create rentals for yourself' });
    }

    // Verify customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Verify car exists
    const car = await Car.findByPk(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if car is available during the requested period
    const conflictingRentals = await Rental.findAll({
      where: {
        carId,
        [require('sequelize').Op.or]: [
          {
            startDate: {
              [require('sequelize').Op.between]: [startDate, endDate]
            }
          },
          {
            endDate: {
              [require('sequelize').Op.between]: [startDate, endDate]
            }
          },
          {
            [require('sequelize').Op.and]: [
              {
                startDate: {
                  [require('sequelize').Op.lte]: startDate
                }
              },
              {
                endDate: {
                  [require('sequelize').Op.gte]: endDate
                }
              }
            ]
          }
        ]
      }
    });

    if (conflictingRentals.length > 0) {
      return res.status(400).json({ message: 'Car is not available during the selected period' });
    }

    // Check if customer already has an active rental
    const activeRentals = await Rental.findAll({
      where: {
        customerId,
        endDate: {
          [require('sequelize').Op.gte]: today
        }
      }
    });

    if (activeRentals.length > 0) {
      return res.status(400).json({ message: 'Customer already has an active rental' });
    }

    const newRental = await Rental.create({
      startDate,
      endDate,
      customerId,
      carId
    });

    // Fetch rental with related data
    const rentalWithData = await Rental.findByPk(newRental.id, {
      include: [
        {
          model: Customer,
          as: 'referredCustomer',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: Car,
          as: 'rentedCar',
          attributes: ['id', 'licensePlate', 'brand', 'model', 'year', 'category']
        }
      ]
    });

    res.status(201).json(rentalWithData);
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update rental (admin only)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
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

    const rental = await Rental.findByPk(req.params.id);
    
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Validate dates if provided
    if (req.body.startDate && req.body.endDate) {
      const start = new Date(req.body.startDate);
      const end = new Date(req.body.endDate);

      if (end <= start) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }

    await rental.update(req.body);
    
    // Fetch updated rental with related data
    const updatedRental = await Rental.findByPk(rental.id, {
      include: [
        {
          model: Customer,
          as: 'referredCustomer',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: Car,
          as: 'rentedCar',
          attributes: ['id', 'licensePlate', 'brand', 'model', 'year', 'category']
        }
      ]
    });

    res.json(updatedRental);
  } catch (error) {
    console.error('Error updating rental:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete rental (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rental = await Rental.findByPk(req.params.id);
    
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    await rental.destroy();
    res.json({ message: 'Rental deleted successfully' });
  } catch (error) {
    console.error('Error deleting rental:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
