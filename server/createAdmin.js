import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Employee } from './models.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/globaldrop-erp';

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const existingAdmin = await Employee.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = new Employee({
      id: 'EMP001',
      name: 'Admin',
      email: 'admin@globaldrop.com',
      phone: '+1 000-000-0000',
      role: 'admin',
      country: 'Headquarters',
      branch: 'Main Branch',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      password: hashedPassword
    });

    await admin.save();
    console.log('✅ Admin created successfully!');
    console.log('   Email:    admin@globaldrop.com');
    console.log('   Password: password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createAdmin();
