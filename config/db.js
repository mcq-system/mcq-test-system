const mongoose = require('mongoose');

/**
 * Connects to the MongoDB database using the URL provided in the environment variables.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/mcq-test-system-tram-be');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;
