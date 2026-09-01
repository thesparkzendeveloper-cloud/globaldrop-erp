import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  Country,
  Branch,
  Employee,
  Attendance,
  Task,
  Product,
  Vendor,
  Transaction,
  FundRequest,
  InventoryRequest,
  Order,
  Notification,
  Setting,
  Lead
} from './models.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/globaldrop-erp';

const countries = [];
const branches = [];
const employees = [
  { id: 'EMP001', name: 'Admin', email: 'Veloraelise@gmail.com', phone: '', role: 'admin', country: '', branch: '', joinDate: '2026-01-01', status: 'active' },
  { id: 'EMP002', name: 'Supervisor', email: 'Shalinishalu121997@gmail.com', phone: '', role: 'supervisor', country: '', branch: '', joinDate: '2026-01-01', status: 'active' },
];

const attendanceRecords = [];
const tasks = [];
const products = [];
const vendors = [];
const transactions = [];
const fundRequests = [];
const inventoryRequests = [];
const orders = [];
const notifications = [];
const sampleLeads = [];

const defaultSettings = {
  companyName: 'GlobalDrop ERP',
  email: 'Veloraelise@gmail.com',
  phone: '',
  address: '',
  taxRate: 0,
  currency: 'USD'
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Country.deleteMany({});
    await Branch.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Task.deleteMany({});
    await Product.deleteMany({});
    await Vendor.deleteMany({});
    await Transaction.deleteMany({});
    await FundRequest.deleteMany({});
    await InventoryRequest.deleteMany({});
    await Order.deleteMany({});
    await Notification.deleteMany({});
    await Lead.deleteMany({});
    try { await Lead.collection.dropIndexes(); } catch (e) {}
    console.log('Cleared existing collections.');

    // Seed Employees (with hashed password)
    const salt = await bcrypt.genSalt(10);
    const hashedEmployees = await Promise.all(employees.map(async (emp) => {
      const plainPwd = emp.role === 'admin' ? 'Velora@admingde' : 'Shalini@veloraelisegde';
      const pwdHash = await bcrypt.hash(plainPwd, salt);
      return {
        ...emp,
        password: pwdHash
      };
    }));

    await Employee.insertMany(hashedEmployees);
    console.log('Seeded Admin & Supervisor Employees.');

    // Seed Settings
    await Setting.create(defaultSettings);
    console.log('Seeded Settings.');

    console.log('Database clean setup completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
