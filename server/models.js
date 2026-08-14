import mongoose from 'mongoose';

// Country Schema
const countrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  currency: { type: String, required: true },
  timezone: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Branch Schema
const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  manager: { type: String, required: true }
}, { timestamps: true });

// Employee Schema
const employeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['admin', 'supervisor', 'employee'], default: 'employee' },
  country: { type: String, required: true },
  branch: { type: String, required: true },
  joinDate: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  password: { type: String, required: true } // will store hashed password
}, { timestamps: true });

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  date: { type: String, required: true },
  checkIn: { type: String, default: '' },
  checkOut: { type: String, default: '' },
  workingHours: { type: String, default: '0h 0m' },
  status: { type: String, enum: ['present', 'absent', 'late'], default: 'absent' }
}, { timestamps: true });

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'on-hold', 'completed'], default: 'pending' },
  assignedTo: { type: String, required: true },
  assignedToName: { type: String, required: true },
  dueDate: { type: String, required: true },
  progress: { type: Number, default: 0 }
}, { timestamps: true });

// Product Schema (Inventory)
const productSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  availableQuantity: { type: Number, required: true },
  reservedQuantity: { type: Number, default: 0 },
  branch: { type: String, required: true },
  status: { type: String, enum: ['available', 'low-stock', 'out-of-stock'], default: 'available' }
}, { timestamps: true });

// Vendor Schema
const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  products: [{ type: String }],
  rating: { type: Number, default: 5 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Transaction Schema (Finance)
const transactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  createdBy: { type: String, required: true },
  date: { type: String, required: true },
  branch: { type: String, required: true }
}, { timestamps: true });

// FundRequest Schema (Approvals)
const fundRequestSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  requestedBy: { type: String, required: true },
  requestDate: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: String, default: '' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

// InventoryRequest Schema (Approvals)
const inventoryRequestSchema = new mongoose.Schema({
  product: { type: String, required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, required: true },
  requestedBy: { type: String, required: true },
  requestDate: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'transferred', 'rejected'], default: 'pending' },
  fromBranch: { type: String, required: true },
  toBranch: { type: String, required: true }
}, { timestamps: true });

// Order Schema
const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customer: { type: String, required: true },
  branch: { type: String, required: true },
  products: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['created', 'packed', 'dispatched', 'delivered'], default: 'created' },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true }
}, { timestamps: true });

// Notification Schema
const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: String, required: true },
  read: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
}, { timestamps: true });

// Setting Schema
const settingSchema = new mongoose.Schema({
  companyName: { type: String, default: 'GlobalDrop ERP' },
  email: { type: String, default: 'admin@globaldrop.com' },
  phone: { type: String, default: '+1 (212) 555-0100' },
  address: { type: String, default: '350 Fifth Avenue, New York, NY 10118' },
  taxRate: { type: Number, default: 15 },
  currency: { type: String, default: 'GBP' }
}, { timestamps: true });

export const Country = mongoose.model('Country', countrySchema);
export const Branch = mongoose.model('Branch', branchSchema);
export const Employee = mongoose.model('Employee', employeeSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
export const Task = mongoose.model('Task', taskSchema);
export const Product = mongoose.model('Product', productSchema);
export const Vendor = mongoose.model('Vendor', vendorSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);
export const FundRequest = mongoose.model('FundRequest', fundRequestSchema);
export const InventoryRequest = mongoose.model('InventoryRequest', inventoryRequestSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const Setting = mongoose.model('Setting', settingSchema);

// Lead Schema (CRM / Lead Generation)
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String, default: '' },
  source: { type: String, enum: ['website', 'social', 'referral', 'cold-call', 'email', 'other'], default: 'website' },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted', 'lost'], default: 'new' },
  assignedTo: { type: String, required: true },
  assignedToName: { type: String, required: true },
  value: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

export const Lead = mongoose.model('Lead', leadSchema);

// AuditLog Schema
const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: String, required: true },
  ip: { type: String, default: 'unknown' },
  details: { type: String, default: '' }
}, { timestamps: true });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

