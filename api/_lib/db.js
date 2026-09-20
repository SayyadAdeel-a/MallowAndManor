import mongoose from 'mongoose';

let cached = null;

const connectDB = async () => {
  if (cached) return cached;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI env var is not set');
  }

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    tls: true,
  });

  cached = conn;
  return conn;
};

export default connectDB;
