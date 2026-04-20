const mongoose = require('mongoose');

/**
 * Kết nối MongoDB, log thông tin kết nối.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/mcq-test-system-tram-be');
    console.log(`Connect to MongoDB: ${conn.connection.host}`);
    console.log(`Sử dụng database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
