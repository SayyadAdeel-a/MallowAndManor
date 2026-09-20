import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      tls: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('\nPossible causes:');
    console.error('  1. Network Access not set to 0.0.0.0/0 in Atlas');
    console.error('  2. Cluster is still provisioning (wait 2-3 minutes)');
    console.error('  3. Wrong username/password in the URI');
    console.error('\nCheck: https://cloud.mongodb.com → Network Access → Add IP 0.0.0.0/0');
    process.exit(1);
  }
};

export default connectDB;
