const Role = require('./Role');
const Customer = require('./Customer');
const Car = require('./Car');
const Rental = require('./Rental');

// Define associations
Role.hasMany(Customer, { foreignKey: 'roleId', as: 'customers' });
Customer.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

Customer.hasMany(Rental, { foreignKey: 'customerId', as: 'customerRentals' });
Rental.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Car.hasMany(Rental, { foreignKey: 'carId', as: 'carRentals' });
Rental.belongsTo(Car, { foreignKey: 'carId', as: 'car' });

module.exports = {
  Role,
  Customer,
  Car,
  Rental
};
