const mongoose = require('mongoose');
require('dotenv').config();   // <-- IMPORTANT FIX

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('❌ MONGODB_URI is missing from .env');
    }

    console.log("🔌 Connecting to MongoDB Atlas...");

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,   // important for Atlas
    });

    console.log('✅ MongoDB Atlas Connected');
    console.log(`📊 DB Name: ${mongoose.connection.name}`);
    console.log(`🌍 Host: ${mongoose.connection.host}\n`);
  }
  catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;