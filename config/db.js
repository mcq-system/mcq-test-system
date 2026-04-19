    console.log('---');
    console.log(`✅ Kết nối MongoDB thành công: ${conn.connection.host}`);
    console.log('---');
  } catch (error) {
    console.error(`❌ Lỗi rồi: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
