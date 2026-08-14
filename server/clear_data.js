import mongoose from 'mongoose';
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
  Setting
} from './models.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/globaldrop-erp';

async function clearData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear all tables
    console.log('Clearing Countries...');
    await Country.deleteMany({});

    console.log('Clearing Branches...');
    await Branch.deleteMany({});

    console.log('Clearing Attendance...');
    await Attendance.deleteMany({});

    console.log('Clearing Tasks...');
    await Task.deleteMany({});

    console.log('Clearing Products/Inventory...');
    await Product.deleteMany({});

    console.log('Clearing Vendors...');
    await Vendor.deleteMany({});

    console.log('Clearing Transactions...');
    await Transaction.deleteMany({});

    console.log('Clearing Fund Requests...');
    await FundRequest.deleteMany({});

    console.log('Clearing Inventory Requests...');
    await InventoryRequest.deleteMany({});

    console.log('Clearing Orders...');
    await Order.deleteMany({});

    console.log('Clearing Notifications...');
    await Notification.deleteMany({});

    // Keep settings, but reset to empty/defaults if needed
    console.log('Clearing/Resetting Settings...');
    await Setting.deleteMany({});
    await Setting.create({
      companyName: 'GlobalDrop ERP',
      email: 'admin@globaldrop.com',
      phone: '+1 (212) 555-0100',
      address: '350 Fifth Avenue, New York, NY 10118',
      taxRate: 15,
      currency: 'USD'
    });

    // Delete all employees except the login users
    console.log('Cleaning Employee list (retaining Admin, Supervisor, and Employee test accounts)...');
    await Employee.deleteMany({
      email: { $nin: ['john.smith@company.com', 'sarah.johnson@company.com', 'emily.davis@company.com'] }
    });

    console.log('Database wiped clean. Only authenticated user accounts are left.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearData();
