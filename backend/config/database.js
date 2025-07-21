const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const initializeDatabase = async () => {
  try {
    const { Role, Customer, Car, Rental } = require('../models');
    
    // Create default roles
    const [customerRole] = await Role.findOrCreate({
      where: { roleName: 'CUSTOMER' },
      defaults: { roleName: 'CUSTOMER' }
    });
    
    const [adminRole] = await Role.findOrCreate({
      where: { roleName: 'ADMIN' },
      defaults: { roleName: 'ADMIN' }
    });

    // Create default admin user
    const adminExists = await Customer.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await Customer.create({
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        password: hashedPassword,
        dateOfBirth: new Date('1990-01-01'),
        roleId: adminRole.id
      });
      console.log('👤 Default admin user created');
    }

    // Create sample cars if none exist
    const carCount = await Car.count();
    if (carCount === 0) {
      await Car.bulkCreate([
        {
          licensePlate: 'ABC-123',
          brand: 'Toyota',
          model: 'Camry',
          year: 2022,
          category: 'Automobile'
        },
        {
          licensePlate: 'DEF-456',
          brand: 'Honda',
          model: 'CR-V',
          year: 2023,
          category: 'Automobile'
        },
        {
          licensePlate: 'GHI-789',
          brand: 'BMW',
          model: 'X3',
          year: 2022,
          category: 'Automobile'
        },
        {
          licensePlate: 'JKL-012',
          brand: 'Mercedes',
          model: 'C-Class',
          year: 2023,
          category: 'Automobile'
        }
      ]);
      console.log('🚗 Sample cars created');
    }

    console.log('🎯 Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync models
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('📊 Database models synchronized');
      await initializeDatabase();
    } else {
      await sequelize.sync();
      await initializeDatabase();
    }
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }
};

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('🔗 Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

module.exports = { sequelize, connectDB, testConnection };
