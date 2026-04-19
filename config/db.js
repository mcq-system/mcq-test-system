const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/mcq-test-system-tram-be');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Using Database: ${conn.connection.name}`);
=======
/**
 * Connects to the MongoDB database using the URL provided in the environment variables.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/mcq-test-system-tram-be');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
>>>>>>> 1b5ea3f4e07e24826392b11fa7e8980b55bb038b
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;
>>>>>>> 1b5ea3f4e07e24826392b11fa7e8980b55bb038b
/**
 * Connects to the MongoDB database using the URL provided in the environment variables.
 */
