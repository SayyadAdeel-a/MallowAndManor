import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import User from './models/User.js';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI, { tls: true });

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

// Seed admin users (passwords from env vars, never hardcoded)
const admins = [
  { email: 'admin@honeybeelane.com', password: process.env.ADMIN_PASSWORD || 'changeme' },
  { email: 'marwashahwazirkhan@gmail.com', password: process.env.ADMIN_PASSWORD_2 || 'changeme' },
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
