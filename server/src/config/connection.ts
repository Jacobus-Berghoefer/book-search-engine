import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks';

console.log("🟡 Attempting to connect to MongoDB at:", MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB!"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Stop the server if MongoDB can't connect
  });

export default mongoose.connection;
