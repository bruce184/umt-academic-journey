import mongoose from 'mongoose';
import { MONGODB_URI } from '../config/env.js';

if (!MONGODB_URI) {
  throw new Error('DB_URI is not defined');
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB database');
  } catch (error) {
    console.error('Failed to connect to MongoDB database', error);
    process.exit(1);
  }
}

export default connectDB;