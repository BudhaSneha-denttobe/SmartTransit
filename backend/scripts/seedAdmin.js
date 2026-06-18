const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seedAdmin() {
  await connectDB();

  const existing = await User.findOne({ email: 'admin@smarttransit.com' });
  if (existing) {
    console.log('Admin user already exists');
    process.exit(0);
  }

  await User.create({
    name: 'Admin',
    email: 'admin@smarttransit.com',
    password: 'admin123',
    role: 'admin',
  });

  console.log('Admin user created:');
  console.log('  Email: admin@smarttransit.com');
  console.log('  Password: admin123');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
