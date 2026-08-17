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

const countries = [
  { name: 'India', code: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', status: 'active' },
  { name: 'United States', code: 'US', currency: 'USD', timezone: 'America/New_York', status: 'active' },
  { name: 'United Kingdom', code: 'UK', currency: 'GBP', timezone: 'Europe/London', status: 'active' },
  { name: 'Germany', code: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', status: 'active' },
  { name: 'Japan', code: 'JP', currency: 'JPY', timezone: 'Asia/Tokyo', status: 'active' },
  { name: 'Australia', code: 'AU', currency: 'AUD', timezone: 'Australia/Sydney', status: 'active' },
  { name: 'Canada', code: 'CA', currency: 'CAD', timezone: 'America/Toronto', status: 'active' },
  { name: 'France', code: 'FR', currency: 'EUR', timezone: 'Europe/Paris', status: 'inactive' },
  { name: 'Singapore', code: 'SG', currency: 'SGD', timezone: 'Asia/Singapore', status: 'active' },
];

const branches = [
  { name: 'India Branch', country: 'India', address: 'MG Road, Bengaluru, Karnataka 560001', phone: '+91 80 1234 5678', email: 'india@company.com', status: 'active', manager: 'Rajesh Kumar' },
  { name: 'New York HQ', country: 'United States', address: '350 Fifth Avenue, New York, NY 10118', phone: '+1 (212) 555-0100', email: 'nyhq@company.com', status: 'active', manager: 'John Smith' },
  { name: 'London Branch', country: 'United Kingdom', address: '10 Downing Street, London SW1A 2AA', phone: '+44 20 7123 4567', email: 'london@company.com', status: 'active', manager: 'Sarah Johnson' },
  { name: 'Berlin Operations', country: 'Germany', address: 'Unter den Linden 77, 10117 Berlin', phone: '+49 30 12345678', email: 'berlin@company.com', status: 'active', manager: 'Hans Mueller' },
  { name: 'Tokyo Office', country: 'Japan', address: '1-2-3 Marunouchi, Chiyoda-ku, Tokyo', phone: '+81 3 1234 5678', email: 'tokyo@company.com', status: 'active', manager: 'Yuki Tanaka' },
  { name: 'Sydney Hub', country: 'Australia', address: '1 Martin Place, Sydney NSW 2000', phone: '+61 2 9876 5432', email: 'sydney@company.com', status: 'active', manager: 'Michael Brown' },
  { name: 'Toronto Center', country: 'Canada', address: '100 Queen Street West, Toronto, ON M5H 2N2', phone: '+1 (416) 555-0123', email: 'toronto@company.com', status: 'inactive', manager: 'Emily Davis' },
  { name: 'Singapore Hub', country: 'Singapore', address: '1 Raffles Place, Singapore 048616', phone: '+65 6789 0123', email: 'singapore@company.com', status: 'active', manager: 'David Chen' },
];

const employees = [
  { id: 'EMP001', name: 'John Smith', email: 'john.smith@company.com', phone: '+1 (212) 555-0101', role: 'admin', country: 'India', branch: 'India Branch', joinDate: '2020-01-15', status: 'active' },
  { id: 'EMP002', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', phone: '+91 80 1234 5679', role: 'supervisor', country: 'India', branch: 'India Branch', joinDate: '2020-03-22', status: 'active' },
  { id: 'EMP003', name: 'Hans Mueller', email: 'hans.mueller@company.com', phone: '+49 30 12345679', role: 'supervisor', country: 'Germany', branch: 'Berlin Operations', joinDate: '2020-06-10', status: 'active' },
  { id: 'EMP004', name: 'Yuki Tanaka', email: 'yuki.tanaka@company.com', phone: '+81 3 1234 5679', role: 'supervisor', country: 'Japan', branch: 'Tokyo Office', joinDate: '2020-08-18', status: 'active' },
  { id: 'EMP005', name: 'Michael Brown', email: 'michael.brown@company.com', phone: '+61 2 9876 5433', role: 'supervisor', country: 'Australia', branch: 'Sydney Hub', joinDate: '2020-11-05', status: 'active' },
  { id: 'EMP006', name: 'Emily Davis', email: 'emily.davis@company.com', phone: '+1 (416) 555-0124', role: 'employee', country: 'Canada', branch: 'Toronto Center', joinDate: '2021-02-28', status: 'active' },
  { id: 'EMP007', name: 'David Chen', email: 'david.chen@company.com', phone: '+65 6789 0124', role: 'supervisor', country: 'Singapore', branch: 'Singapore Hub', joinDate: '2021-05-12', status: 'active' },
  { id: 'EMP008', name: 'Lisa Anderson', email: 'lisa.anderson@company.com', phone: '+1 (212) 555-0102', role: 'employee', country: 'United States', branch: 'New York HQ', joinDate: '2021-07-20', status: 'active' },
  { id: 'EMP009', name: 'James Wilson', email: 'james.wilson@company.com', phone: '+44 20 7123 4569', role: 'employee', country: 'United Kingdom', branch: 'London Branch', joinDate: '2021-09-15', status: 'active' },
  { id: 'EMP010', name: 'Anna Schmidt', email: 'anna.schmidt@company.com', phone: '+49 30 12345680', role: 'employee', country: 'Germany', branch: 'Berlin Operations', joinDate: '2021-11-30', status: 'active' },
  { id: 'EMP011', name: 'Kenji Watanabe', email: 'kenji.watanabe@company.com', phone: '+81 3 1234 5680', role: 'employee', country: 'Japan', branch: 'Tokyo Office', joinDate: '2022-01-10', status: 'inactive' },
  { id: 'EMP012', name: 'Sophie Taylor', email: 'sophie.taylor@company.com', phone: '+61 2 9876 5434', role: 'employee', country: 'Australia', branch: 'Sydney Hub', joinDate: '2022-03-25', status: 'active' },
];

const attendanceRecords = [
  { employeeId: 'EMP001', employeeName: 'John Smith', date: '2026-07-06', checkIn: '08:55', checkOut: '17:30', workingHours: '8h 35m', status: 'present' },
  { employeeId: 'EMP002', employeeName: 'Sarah Johnson', date: '2026-07-06', checkIn: '09:02', checkOut: '17:45', workingHours: '8h 43m', status: 'late' },
  { employeeId: 'EMP008', employeeName: 'Lisa Anderson', date: '2026-07-06', checkIn: '08:58', checkOut: '17:15', workingHours: '8h 17m', status: 'present' },
  { employeeId: 'EMP009', employeeName: 'James Wilson', date: '2026-07-06', checkIn: '', checkOut: '', workingHours: '0h 0m', status: 'absent' },
  { employeeId: 'EMP010', employeeName: 'Anna Schmidt', date: '2026-07-06', checkIn: '08:45', checkOut: '17:20', workingHours: '8h 35m', status: 'present' },
  { employeeId: 'EMP012', employeeName: 'Sophie Taylor', date: '2026-07-06', checkIn: '09:15', checkOut: '17:50', workingHours: '8h 35m', status: 'late' },
  { employeeId: 'EMP006', employeeName: 'Emily Davis', date: '2026-07-06', checkIn: '08:50', checkOut: '17:25', workingHours: '8h 35m', status: 'present' },
  { employeeId: 'EMP003', employeeName: 'Hans Mueller', date: '2026-07-06', checkIn: '08:40', checkOut: '17:10', workingHours: '8h 30m', status: 'present' },
];

const tasks = [
  { title: 'Process Q3 Orders', description: 'Process all pending orders for Q3 shipment', priority: 'high', status: 'in-progress', assignedTo: 'EMP008', assignedToName: 'Lisa Anderson', dueDate: '2026-07-10', progress: 65 },
  { title: 'Update Inventory Database', description: 'Sync inventory data across all branches', priority: 'medium', status: 'pending', assignedTo: 'EMP009', assignedToName: 'James Wilson', dueDate: '2026-07-12', progress: 0 },
  { title: 'Vendor Contract Renewal', description: 'Review and renew vendor contracts for 2026', priority: 'high', status: 'on-hold', assignedTo: 'EMP002', assignedToName: 'Sarah Johnson', dueDate: '2026-07-08', progress: 30 },
  { title: 'Monthly Financial Report', description: 'Prepare monthly financial statements', priority: 'critical', status: 'completed', assignedTo: 'EMP010', assignedToName: 'Anna Schmidt', dueDate: '2026-07-05', progress: 100 },
  { title: 'Branch Audit - Tokyo', description: 'Conduct quarterly audit for Tokyo branch', priority: 'medium', status: 'pending', assignedTo: 'EMP004', assignedToName: 'Yuki Tanaka', dueDate: '2026-07-15', progress: 0 },
  { title: 'Employee Training Program', description: 'Organize Q3 employee training sessions', priority: 'low', status: 'in-progress', assignedTo: 'EMP005', assignedToName: 'Michael Brown', dueDate: '2026-07-20', progress: 45 },
  { title: 'System Backup', description: 'Perform weekly system backup', priority: 'low', status: 'completed', assignedTo: 'EMP008', assignedToName: 'Lisa Anderson', dueDate: '2026-07-06', progress: 100 },
  { title: 'Customer Support Analysis', description: 'Analyze customer support tickets for improvements', priority: 'medium', status: 'pending', assignedTo: 'EMP012', assignedToName: 'Sophie Taylor', dueDate: '2026-07-18', progress: 0 },
];

const products = [
  { sku: 'SKU-001', name: 'Wireless Bluetooth Earbuds', category: 'Electronics', costPrice: 25, sellingPrice: 49.99, availableQuantity: 1500, reservedQuantity: 200, branch: 'New York HQ', status: 'available' },
  { sku: 'SKU-002', name: 'Smart Watch Pro', category: 'Electronics', costPrice: 85, sellingPrice: 159.99, availableQuantity: 500, reservedQuantity: 100, branch: 'London Branch', status: 'available' },
  { sku: 'SKU-003', name: 'Portable Power Bank 20000mAh', category: 'Electronics', costPrice: 18, sellingPrice: 39.99, availableQuantity: 45, reservedQuantity: 5, branch: 'Berlin Operations', status: 'low-stock' },
  { sku: 'SKU-004', name: 'Ergonomic Office Chair', category: 'Furniture', costPrice: 120, sellingPrice: 249.99, availableQuantity: 200, reservedQuantity: 50, branch: 'Tokyo Office', status: 'available' },
  { sku: 'SKU-005', name: 'Standing Desk Converter', category: 'Furniture', costPrice: 95, sellingPrice: 199.99, availableQuantity: 0, reservedQuantity: 0, branch: 'Sydney Hub', status: 'out-of-stock' },
  { sku: 'SKU-006', name: 'USB-C Hub 7-in-1', category: 'Electronics', costPrice: 12, sellingPrice: 29.99, availableQuantity: 800, reservedQuantity: 100, branch: 'New York HQ', status: 'available' },
  { sku: 'SKU-007', name: 'Mechanical Keyboard RGB', category: 'Electronics', costPrice: 45, sellingPrice: 89.99, availableQuantity: 300, reservedQuantity: 50, branch: 'Singapore Hub', status: 'available' },
  { sku: 'SKU-008', name: 'Wireless Gaming Mouse', category: 'Electronics', costPrice: 30, sellingPrice: 59.99, availableQuantity: 25, reservedQuantity: 5, branch: 'London Branch', status: 'low-stock' },
  { sku: 'SKU-009', name: '4K Webcam Pro', category: 'Electronics', costPrice: 40, sellingPrice: 79.99, availableQuantity: 250, reservedQuantity: 30, branch: 'Tokyo Office', status: 'available' },
  { sku: 'SKU-010', name: 'Monitor Stand with USB', category: 'Furniture', costPrice: 35, sellingPrice: 69.99, availableQuantity: 400, reservedQuantity: 80, branch: 'Sydney Hub', status: 'available' },
];

const vendors = [
  { name: 'TechSupply Co.', email: 'contact@techsupply.com', phone: '+1 (800) 555-0001', country: 'United States', products: ['Wireless Bluetooth Earbuds', 'Smart Watch Pro', 'USB-C Hub 7-in-1'], rating: 4.8, status: 'active' },
  { name: 'Global Electronics Ltd', email: 'info@globalelec.com', phone: '+44 800 123 4567', country: 'United Kingdom', products: ['Portable Power Bank 20000mAh', '4K Webcam Pro'], rating: 4.5, status: 'active' },
  { name: 'Asia Pacific Trading', email: 'sales@asiapac.com', phone: '+81 3 0000 0001', country: 'Japan', products: ['Mechanical Keyboard RGB', 'Wireless Gaming Mouse'], rating: 4.2, status: 'active' },
  { name: 'Euro Furnish', email: 'info@eurofurnish.com', phone: '+49 30 0000 0001', country: 'Germany', products: ['Ergonomic Office Chair', 'Standing Desk Converter', 'Monitor Stand with USB'], rating: 4.6, status: 'active' },
  { name: 'Quick Parts Inc.', email: 'orders@quickparts.com', phone: '+1 (800) 555-0002', country: 'United States', products: ['USB-C Hub 7-in-1'], rating: 3.9, status: 'inactive' },
];

const transactions = [
  { id: 'TXN001', type: 'income', amount: 125000, description: 'Bulk order - TechSupply Co.', category: 'Sales', createdBy: 'John Smith', date: '2026-07-01', branch: 'New York HQ' },
  { id: 'TXN002', type: 'expense', amount: 45000, description: 'Vendor payment - Global Electronics', category: 'Inventory', createdBy: 'Sarah Johnson', date: '2026-07-02', branch: 'London Branch' },
  { id: 'TXN003', type: 'income', amount: 89000, description: 'Monthly subscription renewals', category: 'Subscriptions', createdBy: 'John Smith', date: '2026-07-03', branch: 'New York HQ' },
  { id: 'TXN004', type: 'expense', amount: 12000, description: 'Employee training program', category: 'Training', createdBy: 'Michael Brown', date: '2026-07-04', branch: 'Sydney Hub' },
  { id: 'TXN005', type: 'expense', amount: 25000, description: 'Office equipment purchase', category: 'Equipment', createdBy: 'Hans Mueller', date: '2026-07-05', branch: 'Berlin Operations' },
  { id: 'TXN006', type: 'income', amount: 200000, description: 'Enterprise contract - ABC Corp', category: 'Sales', createdBy: 'John Smith', date: '2026-07-06', branch: 'New York HQ' },
  { id: 'TXN007', type: 'expense', amount: 35000, description: 'Marketing campaign Q3', category: 'Marketing', createdBy: 'Yuki Tanaka', date: '2026-07-06', branch: 'Tokyo Office' },
];

const fundRequests = [
  { amount: 15000, reason: 'Branch renovation and equipment upgrade', requestedBy: 'Sarah Johnson', requestDate: '2026-07-01', status: 'pending' },
  { amount: 8000, reason: 'Employee training program materials', requestedBy: 'Michael Brown', requestDate: '2026-07-02', status: 'approved', approvedBy: 'John Smith', remarks: 'Approved for Q3 training initiative' },
  { amount: 25000, reason: 'Emergency inventory restocking', requestedBy: 'Yuki Tanaka', requestDate: '2026-07-03', status: 'pending' },
  { amount: 5000, reason: 'Office supplies and stationery', requestedBy: 'Hans Mueller', requestDate: '2026-07-04', status: 'rejected', approvedBy: 'John Smith', remarks: 'Budget reallocated to other priorities' },
  { amount: 12000, reason: 'Marketing materials for product launch', requestedBy: 'Lisa Anderson', requestDate: '2026-07-05', status: 'pending' },
];

const inventoryRequests = [
  { product: 'Wireless Bluetooth Earbuds', quantity: 500, reason: 'High demand forecast for Q3', requestedBy: 'Lisa Anderson', requestDate: '2026-07-01', status: 'pending', fromBranch: 'New York HQ', toBranch: 'London Branch' },
  { product: 'Smart Watch Pro', quantity: 200, reason: 'Stock replenishment', requestedBy: 'James Wilson', requestDate: '2026-07-02', status: 'approved', fromBranch: 'Berlin Operations', toBranch: 'Tokyo Office' },
  { product: 'Portable Power Bank 20000mAh', quantity: 1000, reason: 'Critical stock level', requestedBy: 'Anna Schmidt', requestDate: '2026-07-03', status: 'transferred', fromBranch: 'Singapore Hub', toBranch: 'Berlin Operations' },
  { product: 'Ergonomic Office Chair', quantity: 50, reason: 'New employee onboarding', requestedBy: 'David Chen', requestDate: '2026-07-04', status: 'pending', fromBranch: 'Sydney Hub', toBranch: 'Singapore Hub' },
  { product: 'USB-C Hub 7-in-1', quantity: 300, reason: 'Inventory transfer for new project', requestedBy: 'Sophie Taylor', requestDate: '2026-07-05', status: 'rejected', fromBranch: 'New York HQ', toBranch: 'Sydney Hub' },
];

const orders = [
  { id: 'ORD001', customer: 'TechCorp Industries', branch: 'New York HQ', products: [{ name: 'Wireless Bluetooth Earbuds', quantity: 100, price: 49.99 }, { name: 'USB-C Hub 7-in-1', quantity: 50, price: 29.99 }], totalAmount: 6498.50, status: 'delivered', createdAt: '2026-07-01', updatedAt: '2026-07-04' },
  { id: 'ORD002', customer: 'Global Retail Co.', branch: 'London Branch', products: [{ name: 'Smart Watch Pro', quantity: 25, price: 159.99 }, { name: 'Wireless Gaming Mouse', quantity: 50, price: 59.99 }], totalAmount: 6998.75, status: 'dispatched', createdAt: '2026-07-02', updatedAt: '2026-07-05' },
  { id: 'ORD003', customer: 'Pacific Trading', branch: 'Tokyo Office', products: [{ name: 'Mechanical Keyboard RGB', quantity: 75, price: 89.99 }, { name: '4K Webcam Pro', quantity: 30, price: 79.99 }], totalAmount: 9148.25, status: 'packed', createdAt: '2026-07-03', updatedAt: '2026-07-05' },
  { id: 'ORD004', customer: 'Euro Supplies Ltd', branch: 'Berlin Operations', products: [{ name: 'Ergonomic Office Chair', quantity: 20, price: 249.99 }, { name: 'Monitor Stand with USB', quantity: 40, price: 69.99 }], totalAmount: 7898.60, status: 'created', createdAt: '2026-07-05', updatedAt: '2026-07-05' },
  { id: 'ORD005', customer: 'AUS Wholesale', branch: 'Sydney Hub', products: [{ name: 'Portable Power Bank 20000mAh', quantity: 200, price: 39.99 }], totalAmount: 7998.00, status: 'created', createdAt: '2026-07-06', updatedAt: '2026-07-06' },
  { id: 'ORD006', customer: 'Singapore Tech', branch: 'Singapore Hub', products: [{ name: 'Mechanical Keyboard RGB', quantity: 40, price: 89.99 }, { name: 'USB-C Hub 7-in-1', quantity: 60, price: 29.99 }], totalAmount: 5398.80, status: 'delivered', createdAt: '2026-06-28', updatedAt: '2026-07-02' },
];

const notifications = [
  { type: 'task', title: 'New Task Assigned', message: 'You have been assigned to "Process Q3 Orders" due on July 10, 2026', timestamp: '2026-07-06 09:30', read: false, priority: 'high' },
  { type: 'inventory', title: 'Inventory Request Approved', message: 'Your request for Smart Watch Pro (200 units) has been approved', timestamp: '2026-07-06 10:15', read: false, priority: 'medium' },
  { type: 'fund', title: 'Fund Request Rejected', message: 'Your fund request for $5,000 (Office supplies) was rejected', timestamp: '2026-07-05 16:45', read: true, priority: 'medium' },
  { type: 'alert', title: 'Critical: Low Stock Alert', message: 'Portable Power Bank 20000mAh is at critical stock level (45 units remaining)', timestamp: '2026-07-06 08:00', read: false, priority: 'critical' },
  { type: 'order', title: 'Order Delivered', message: 'Order #ORD001 to TechCorp Industries has been delivered successfully', timestamp: '2026-07-04 14:20', read: true, priority: 'low' },
  { type: 'task', title: 'Task Completed', message: 'System Backup task has been marked as completed', timestamp: '2026-07-06 11:30', read: true, priority: 'low' },
  { type: 'fund', title: 'New Fund Request', message: 'Sarah Johnson has requested $15,000 for branch renovation', timestamp: '2026-07-06 12:00', read: false, priority: 'high' },
  { type: 'alert', title: 'Security Alert', message: 'Multiple failed login attempts detected from IP 192.168.1.100', timestamp: '2026-07-05 22:15', read: true, priority: 'critical' },
];

const defaultSettings = {
  companyName: 'GlobalDrop ERP',
  email: 'admin@globaldrop.com',
  phone: '+1 (212) 555-0100',
  address: '350 Fifth Avenue, New York, NY 10118',
  taxRate: 15,
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

    // Seed Countries
    await Country.insertMany(countries);
    console.log('Seeded Countries.');

    // Seed Branches
    await Branch.insertMany(branches);
    console.log('Seeded Branches.');

    // Seed Employees (with hashed password)
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    const hashedEmployees = employees.map(emp => ({
      ...emp,
      password: defaultPasswordHash
    }));

    await Employee.insertMany(hashedEmployees);
    console.log('Seeded Employees (password for all: password123).');

    // Seed Attendance
    await Attendance.insertMany(attendanceRecords);
    console.log('Seeded Attendance.');

    // Seed Tasks
    await Task.insertMany(tasks);
    console.log('Seeded Tasks.');

    // Seed Products
    await Product.insertMany(products);
    console.log('Seeded Products.');

    // Seed Vendors
    await Vendor.insertMany(vendors);
    console.log('Seeded Vendors.');

    // Seed Transactions
    await Transaction.insertMany(transactions);
    console.log('Seeded Transactions.');

    // Seed Fund Requests
    await FundRequest.insertMany(fundRequests);
    console.log('Seeded Fund Requests.');

    // Seed Inventory Requests
    await InventoryRequest.insertMany(inventoryRequests);
    console.log('Seeded Inventory Requests.');

    // Seed Orders
    await Order.insertMany(orders);
    console.log('Seeded Orders.');

    // Seed Notifications
    await Notification.insertMany(notifications);
    console.log('Seeded Notifications.');

    // Seed Leads
    const sampleLeads = [
      { id: 'LEAD001', name: 'Robert Fox', email: 'robert.fox@acme.com', phone: '+1 555-0192', company: 'Acme Logistics', source: 'website', status: 'new', assignedTo: 'EMP001', assignedToName: 'John Smith', value: 45000, notes: 'Interested in bulk drop shipping services' },
      { id: 'LEAD002', name: 'Kristin Watson', email: 'kristin.w@nexus.io', phone: '+1 555-0143', company: 'Nexus Retail', source: 'referral', status: 'qualified', assignedTo: 'EMP002', assignedToName: 'Sarah Johnson', value: 82000, notes: 'Contract under review' },
      { id: 'LEAD003', name: 'Eleanor Pena', email: 'eleanor@globaltrend.com', phone: '+44 20 7946 0912', company: 'Global Trends UK', source: 'social', status: 'contacted', assignedTo: 'EMP002', assignedToName: 'Sarah Johnson', value: 28000, notes: 'Follow-up call scheduled next Tuesday' },
      { id: 'LEAD004', name: 'Cody Fisher', email: 'cody.fisher@apex.de', phone: '+49 30 901820', company: 'Apex Imports GmbH', source: 'cold-call', status: 'converted', assignedTo: 'EMP003', assignedToName: 'Hans Mueller', value: 120000, notes: 'Closed annual contract on Q3' },
      { id: 'LEAD005', name: 'Jane Cooper', email: 'jane@coopertech.jp', phone: '+81 3 5555 0182', company: 'Cooper Tech Japan', source: 'email', status: 'new', assignedTo: 'EMP004', assignedToName: 'Yuki Tanaka', value: 35000, notes: 'Inquired via contact form' },
    ];
    await Lead.insertMany(sampleLeads);
    console.log('Seeded Leads.');

    // Seed Settings
    await Setting.create(defaultSettings);
    console.log('Seeded Settings.');

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
