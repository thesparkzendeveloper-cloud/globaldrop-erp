import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
import { Employee } from './models.js';

dotenv.config();
dotenv.config({ path: '../.env' });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    if (!MONGODB_URI) throw new Error('MONGO_URI is missing in .env');
    await mongoose.connect(MONGODB_URI, { dbName: 'globalERP' });
    console.log('Connected.');

    const existingAdmin = await Employee.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Velora@admingde', 10);
    const admin = new Employee({
      id: 'EMP001',
      name: 'Admin',
      email: 'Veloraelise@gmail.com',
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
    console.log('   Email:    Veloraelise@gmail.com');
    console.log('   Password: Velora@admingde');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createAdmin();
