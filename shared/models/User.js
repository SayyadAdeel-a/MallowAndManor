import mongoose from 'mongoose';

export const USER_ROLES = ['admin', 'staff'];

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  // Least privilege by default: an account is NOT an admin unless explicitly promoted.
  role: { type: String, enum: USER_ROLES, default: 'staff' },
  // Bumped on logout/refresh to invalidate outstanding refresh tokens.
  tokenVersion: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
