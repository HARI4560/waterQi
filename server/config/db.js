const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,  // Wait up to 15s for MongoDB Atlas to wake up
        socketTimeoutMS: 45000,           // Keep sockets alive longer
        maxPoolSize: 10,                  // Connection pool
        retryWrites: true,
        retryReads: true,
      });
      console.log('MongoDB Connected');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1}/${retries} failed: ${error.message}`);
      if (i < retries - 1) {
        const delay = Math.min(1000 * Math.pow(2, i), 10000); // Exponential backoff: 1s, 2s, 4s, 8s, 10s
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('All MongoDB connection attempts failed. Server will continue but DB calls will fail.');
};

// Auto-reconnect on disconnect
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting reconnect...');
  setTimeout(() => connectDB(3), 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

module.exports = connectDB;
