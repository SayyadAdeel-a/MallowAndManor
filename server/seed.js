import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import User from './models/User.js';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

// Seed categories
const categories = [
  { slug: 'bangles', name: 'Bangles', icon: '💍' },
  { slug: 'nails', name: 'Nails', icon: '💅' },
  { slug: 'abayas', name: 'Abayas', icon: '👗' },
  { slug: 'necklaces', name: 'Necklaces', icon: '✨' },
];

for (const cat of categories) {
  await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true });
}
console.log('Categories seeded');

// Seed admin users
const admins = [
  { email: 'admin@honeybeelane.com', password: 'HoneybeeLane2026!@#' },
  { email: 'marwashahwazirkhan@gmail.com', password: 'marwashahwazirkhanbusiness@1' },
];

for (const admin of admins) {
  const hashedPassword = await bcrypt.hash(admin.password, 12);
  await User.findOneAndUpdate(
    { email: admin.email },
    { email: admin.email, password: hashedPassword, role: 'admin' },
    { upsert: true }
  );
}
console.log('Admin users seeded');

await mongoose.disconnect();
console.log('Done');
