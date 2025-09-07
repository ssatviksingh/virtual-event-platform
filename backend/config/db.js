const mongoose = require('mongoose'); // import mongoose

/**
 * Initialize a connection to MongoDB via Mongoose.
 */

const connectDB = async () => { // connect to mongodb function
  try {
    await mongoose.connect(process.env.MONGO_URI); // connect to mongodb
    console.log('✅ MongoDB Connected'); // log success
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message); // log error
    process.exit(1); // exit with failure
  }
}; // connect to mongodb function

module.exports = connectDB; // export connectDB
