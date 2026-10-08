import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// The single owner of the MongoDB connection.
//
// IMPORTANT: this module must be the only place that calls mongoose.connect().
// The repo previously had TWO mongoose copies installed (root node_modules and
// server/node_modules), so `server/config/db.js` connected one instance while
// the models registered themselves on another. Every query then sat in
// mongoose's buffer and failed with:
//   Operation `sitesettings.findOne()` buffering timed out after 10000ms
// Routing all connection logic through one module guarantees the models and the
// connection always share the same mongoose instance.
// ---------------------------------------------------------------------------

let cached = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (cached) return cached;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI env var is not set');
  }

  // Windows / MongoDB Dev Desktop Node.js fails on the mongodb+srv:// protocol,
  // so use mongodb:// with tls:true (see AGENTS.md "Gotchas").
  cached = await mongoose.connect(uri, {
    tls: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  return cached;
};

export default connectDB;
export { mongoose };
