const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Customer = require('./Customer');
const Car = require('./Car');

const Rental = sequelize.define('Rental', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isAfterStartDate(value) {
        if (this.startDate && value <= this.startDate) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  customerId: {
    type: DataTypes.INTEGER,
    references: {
      model: Customer,
      key: 'id'
    }
  },
  carId: {
    type: DataTypes.INTEGER,
    references: {
      model: Car,
      key: 'id'
    }
  }
}, {
  tableName: 'rentals',
  timestamps: true
});

// Define associations
Rental.belongsTo(Customer, { foreignKey: 'customerId', as: 'referredCustomer' });
Rental.belongsTo(Car, { foreignKey: 'carId', as: 'rentedCar' });

Customer.hasMany(Rental, { foreignKey: 'customerId', as: 'rentals' });
Car.hasMany(Rental, { foreignKey: 'carId', as: 'rentals' });

module.exports = Rental;
