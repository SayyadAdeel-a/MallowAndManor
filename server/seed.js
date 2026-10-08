import path from 'node:path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import User from './models/User.js';

dotenv.config({ path: path.resolve(import.meta.dirname, '.env') });

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Copy .env.example to server/.env and fill it in.');
  process.exit(1);
}

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

// Seed admin users.
//
// Passwords MUST come from the environment. Previously each account silently
// fell back to the literal string "changeme", so running the seed with no
// ADMIN_PASSWORD set created a super-admin with a publicly guessable password.
const admins = [
  { email: process.env.ADMIN_EMAIL_1 || 'admin@honeybeelane.com', password: process.env.ADMIN_PASSWORD },
  { email: process.env.ADMIN_EMAIL_2, password: process.env.ADMIN_PASSWORD_2 },
];

const missing = admins.filter((a) => !a.email || !a.password);
if (missing.length) {
  console.error(
    'Refusing to seed: ADMIN_PASSWORD / ADMIN_PASSWORD_2 must be set to strong values.\n' +
    'Generate one with:\n' +
    '  node -e "console.log(require(\'crypto\').randomBytes(24).toString(\'base64url\'))"',
  );
  process.exit(1);
}

const weak = admins.filter((a) => a.password.length < 16);
if (weak.length) {
  console.error('Refusing to seed: admin passwords must be at least 16 characters.');
  process.exit(1);
}

for (const admin of admins) {
  const hashedPassword = await bcrypt.hash(admin.password, 12);
  // Role is set explicitly; the model default is now "staff" (least privilege).
  await User.findOneAndUpdate(
    { email: admin.email.toLowerCase().trim() },
    { email: admin.email.toLowerCase().trim(), password: hashedPassword, role: 'admin' },
    { upsert: true },
  );
}
console.log('Admin users seeded');

await mongoose.disconnect();
console.log('Done');
