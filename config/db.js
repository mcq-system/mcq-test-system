const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);

    console.log('---');
    console.log(`✅ Kết nối MongoDB thành công: ${conn.connection.host}`);
    console.log('---');
  } catch (error) {
    console.error(`❌ Lỗi rồi: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;