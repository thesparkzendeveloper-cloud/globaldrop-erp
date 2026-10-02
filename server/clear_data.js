import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
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
  Lead,
  Customer,
  AuditLog
} from './models.js';

dotenv.config();
dotenv.config({ path: '../.env' });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function clearData() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    if (!MONGODB_URI) throw new Error('MONGO_URI is missing in .env');
    await mongoose.connect(MONGODB_URI, { dbName: 'globalERP' });
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

    console.log('Clearing Customers...');
    await Customer.deleteMany({});

    console.log('Clearing Leads...');
    await Lead.deleteMany({});

    console.log('Clearing Audit Logs...');
    await AuditLog.deleteMany({});

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
    console.log('Cleaning Employee list (retaining Admin, Supervisor)...');
    await Employee.deleteMany({
      email: { $nin: ['Veloraelise@gmail.com', 'Shalinishalu121997@gmail.com', 'admin@globaldrop.com'] }
    });

    console.log('Database wiped clean. Only authenticated user accounts are left.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearData();
