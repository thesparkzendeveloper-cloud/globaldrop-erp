import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  Country, Branch, Employee, Attendance, Task,
  Product, Vendor, Transaction, FundRequest,
  InventoryRequest, Order, Notification, Setting, Lead, AuditLog
} from './models.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/globaldrop-erp';

async function clearAll() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

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
    await Setting.deleteMany({});
    await Lead.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('✅ All collections cleared successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing collections:', err);
    process.exit(1);
  }
}

clearAll();
