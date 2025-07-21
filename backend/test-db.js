require('dotenv').config();
const { testConnection } = require('./config/database');

async function testDB() {
  console.log('🔍 Testing database connection...\n');
  
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Database connection successful!');
    console.log('📍 You can now start the server with: npm start');
  } else {
    console.log('❌ Database connection failed!');
    console.log('📋 Please check:');
    console.log('   1. MySQL service is running');
    console.log('   2. Database "rental_car_db" exists');
    console.log('   3. Username and password in .env are correct');
    console.log('   4. MySQL is listening on port 3306');
  }
  
  process.exit(0);
}

testDB();
