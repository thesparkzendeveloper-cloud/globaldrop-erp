import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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
  AuditLog
} from './models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/globaldrop-erp';
const JWT_SECRET = process.env.JWT_SECRET || 'globaldrop_erp_secret_key_2026';

app.use(cors());
app.use(express.json());

// Middleware for JWT Verification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access Token Required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or Expired Token' });
    req.user = user;
    next();
  });
};

// Helper for Audit Logging
const logAudit = async (req, action, details) => {
  try {
    const user = req.user ? req.user.email : (req.body && req.body.email ? req.body.email.toLowerCase() : 'System');
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const log = new AuditLog({ action, user, ip, details });
    await log.save();
  } catch (error) {
    console.error('Audit Log failed:', error);
  }
};

// --- AUTHENTICATION ENDPOINTS ---

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const employee = await Employee.findOne({ email: email.toLowerCase() });
    if (!employee) {
      await logAudit(req, 'Login Failed', `Failed login attempt with email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (employee.status !== 'active') {
      await logAudit(req, 'Login Blocked', `Blocked login attempt for inactive account: ${email}`);
      return res.status(403).json({ message: 'Your account is inactive. Contact admin.' });
    }

    const validPassword = await bcrypt.compare(password, employee.password);
    if (!validPassword) {
      await logAudit(req, 'Login Failed', `Failed login attempt (incorrect password) for email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      branch: employee.branch,
      country: employee.country
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    req.user = payload; // Temporarily attach user for audit log
    await logAudit(req, 'Login', 'User logged in successfully');

    res.json({ token, user: payload });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    await logAudit(req, 'Logout', 'User logged out successfully');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findOne({ id: req.user.id });
    if (!employee) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      branch: employee.branch,
      country: employee.country
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Middleware for Role Authorization
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// --- GENERIC CRUD FUNCTION BUILDER ---
const createCrudRoutes = (path, Model, readRoles = ['admin', 'supervisor', 'employee'], writeRoles = ['admin']) => {
  app.get(`/api/${path}`, authenticateToken, requireRole(readRoles), async (req, res) => {
    try {
      let query = {};
      if (path === 'employees' && req.user.role === 'supervisor') {
        query = { branch: req.user.branch };
      }
      if (path === 'attendance' && req.user.role === 'employee') {
        query = { employeeId: req.user.id };
      }
      if (path === 'tasks' && req.user.role === 'employee') {
        query = { assignedTo: req.user.id };
      }
      const items = await Model.find(query).sort({ createdAt: -1 });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post(`/api/${path}`, authenticateToken, requireRole(writeRoles), async (req, res) => {
    try {
      if (path === 'employees' && req.user.role === 'supervisor') {
        req.body.branch = req.user.branch;
        req.body.role = 'employee';
      }
      const newItem = new Model(req.body);
      const savedItem = await newItem.save();
      await logAudit(req, 'Create', `Created new item in ${Model.modelName} (ID: ${savedItem._id || savedItem.id}): ${JSON.stringify(req.body)}`);
      res.status(201).json(savedItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put(`/api/${path}/:id`, authenticateToken, requireRole(writeRoles), async (req, res) => {
    try {
      if (path === 'employees' && req.user.role === 'supervisor') {
        const target = await Model.findById(req.params.id);
        if (target && target.branch !== req.user.branch) {
          return res.status(403).json({ message: 'Forbidden: Can only manage employees in your branch' });
        }
      }
      const updatedItem = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
      await logAudit(req, 'Update', `Updated item in ${Model.modelName} (ID: ${req.params.id}): ${JSON.stringify(req.body)}`);
      res.json(updatedItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete(`/api/${path}/:id`, authenticateToken, requireRole(writeRoles), async (req, res) => {
    try {
      if (path === 'employees' && req.user.role === 'supervisor') {
        return res.status(403).json({ message: 'Forbidden: Supervisor cannot delete employees' });
      }
      const deletedItem = await Model.findByIdAndDelete(req.params.id);
      if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
      await logAudit(req, 'Delete', `Deleted item in ${Model.modelName} (ID: ${req.params.id})`);
      res.json({ message: 'Deleted successfully', item: deletedItem });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

// Register CRUD routes with appropriate permissions
createCrudRoutes('countries', Country, ['admin'], ['admin']);
createCrudRoutes('branches', Branch, ['admin', 'supervisor', 'employee'], ['admin']);
createCrudRoutes('employees', Employee, ['admin', 'supervisor'], ['admin', 'supervisor']);
createCrudRoutes('attendance', Attendance, ['admin', 'supervisor', 'employee'], ['admin', 'supervisor', 'employee']);
createCrudRoutes('tasks', Task, ['admin', 'supervisor', 'employee'], ['admin', 'supervisor', 'employee']);
createCrudRoutes('inventory', Product, ['admin', 'supervisor'], ['admin', 'supervisor']);
createCrudRoutes('vendors', Vendor, ['admin'], ['admin']);
createCrudRoutes('transactions', Transaction, ['admin'], ['admin']);
createCrudRoutes('fund-requests', FundRequest, ['admin', 'supervisor'], ['admin', 'supervisor']);
createCrudRoutes('inventory-requests', InventoryRequest, ['admin', 'supervisor'], ['admin', 'supervisor']);
createCrudRoutes('orders', Order, ['admin', 'supervisor'], ['admin', 'supervisor']);
createCrudRoutes('notifications', Notification, ['admin', 'supervisor', 'employee'], ['admin', 'supervisor', 'employee']);
createCrudRoutes('leads', Lead, ['admin', 'supervisor'], ['admin', 'supervisor']);

// Custom POST route for orders to auto-decrement inventory stock in MongoDB
app.post('/api/orders', authenticateToken, requireRole(['admin', 'supervisor']), async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    // Auto decrease stock for ordered products
    if (req.body.products && Array.isArray(req.body.products)) {
      for (const item of req.body.products) {
        const prod = await Product.findOne({ name: { $regex: new RegExp(`^${item.name}$`, 'i') } });
        if (prod) {
          const newQty = Math.max(0, prod.availableQuantity - (item.quantity || 1));
          const newStatus = newQty === 0 ? 'out-of-stock' : newQty <= 50 ? 'low-stock' : 'available';
          await Product.findByIdAndUpdate(prod._id, { availableQuantity: newQty, status: newStatus });
        }
      }
    }

    await logAudit(req, 'Create Order', `Created order ${savedOrder.id} for ${savedOrder.customer}`);
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Custom endpoint for secure employee creation
app.post('/api/employees/secure', authenticateToken, requireRole(['admin', 'supervisor']), async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    if (req.user.role === 'supervisor') {
      rest.branch = req.user.branch;
      rest.role = 'employee';
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);

    const newEmp = new Employee({
      ...rest,
      password: hashedPassword
    });
    const saved = await newEmp.save();
    await logAudit(req, 'Create', `Created employee ${saved.email} (${saved.name}) with role: ${saved.role}`);
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Custom endpoint for settings
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({
        companyName: 'GlobalDrop ERP',
        email: 'admin@globaldrop.com',
        phone: '+1 (212) 555-0100',
        address: '350 Fifth Avenue, New York, NY 10118',
        taxRate: 15,
        currency: 'GBP'
      });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/settings', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (setting) {
      setting = await Setting.findByIdAndUpdate(setting._id, req.body, { new: true });
    } else {
      setting = await Setting.create(req.body);
    }
    await logAudit(req, 'Update Settings', `Updated global system settings`);
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Custom endpoints for attendance
app.post('/api/attendance/check-in', authenticateToken, async (req, res) => {
  try {
    const { employeeId, employeeName } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"

    let record = await Attendance.findOne({ employeeId, date: today });
    if (record) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const isLate = nowTime > '09:00';
    const status = isLate ? 'late' : 'present';

    record = new Attendance({
      employeeId,
      employeeName,
      date: today,
      checkIn: nowTime,
      status
    });

    await record.save();
    await logAudit(req, 'Check-In', `Employee ${employeeName} checked in at ${nowTime} (Status: ${status})`);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/attendance/check-out', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"

    const record = await Attendance.findOne({ employeeId, date: today });
    if (!record) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (record.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    record.checkOut = nowTime;

    if (record.checkIn) {
      const [inH, inM] = record.checkIn.split(':').map(Number);
      const [outH, outM] = nowTime.split(':').map(Number);
      let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
      if (diffMinutes < 0) diffMinutes = 0;
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      record.workingHours = `${hours}h ${mins}m`;
    }

    await record.save();
    await logAudit(req, 'Check-Out', `Employee ${record.employeeName} checked out at ${nowTime} (Hours worked: ${record.workingHours})`);
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Custom endpoint for audit logs
app.get('/api/audit-logs', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dynamic dashboard stats calculations
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const totalCountries = await Country.countDocuments();
    const totalBranches = await Branch.countDocuments();
    const totalEmployees = await Employee.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Total inventory
    const productsList = await Product.find();
    const totalInventory = productsList.reduce((acc, p) => acc + (p.availableQuantity || 0), 0);

    // Pending requests
    const pendingFunds = await FundRequest.countDocuments({ status: 'pending' });
    const pendingInv = await InventoryRequest.countDocuments({ status: 'pending' });
    const pendingRequests = pendingFunds + pendingInv;

    // Finance Summary
    const transactionsList = await Transaction.find();
    const income = transactionsList.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactionsList.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const budget = 5000000;
    const balance = budget - expenses + income;

    // Notifications
    const unreadNotificationsCount = await Notification.countDocuments({ read: false });

    // --- SUPERVISOR SPECIFIC STATS ---
    const branchEmployees = await Employee.find({ branch: req.user.branch }).select('id name');
    const branchEmployeeIds = branchEmployees.map(e => e.id);
    const branchEmployeeNames = branchEmployees.map(e => e.name);
    
    const supervisorPendingRequests = await FundRequest.countDocuments({ status: 'pending', requestedBy: { $in: branchEmployeeNames } });
    const supervisorPendingInventory = await InventoryRequest.countDocuments({ status: 'pending', fromBranch: req.user.branch });
    
    const supervisorTasks = await Task.countDocuments({ assignedTo: { $in: branchEmployeeIds }, status: { $ne: 'completed' } });
    const totalBranchTasks = await Task.countDocuments({ assignedTo: { $in: branchEmployeeIds } });
    const completedBranchTasks = await Task.countDocuments({ assignedTo: { $in: branchEmployeeIds }, status: 'completed' });
    const branchPerformance = totalBranchTasks > 0 ? Math.round((completedBranchTasks / totalBranchTasks) * 100) : 100;

    const branchTransactions = transactionsList.filter(t => t.branch === req.user.branch);
    const branchExpenses = branchTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const availableBudget = Math.max(0, 150000 - branchExpenses);

    // --- EMPLOYEE SPECIFIC STATS ---
    const employeeAttendance = await Attendance.find({ employeeId: req.user.id });
    const empPresent = employeeAttendance.filter(r => r.status === 'present').length;
    const empAbsent = employeeAttendance.filter(r => r.status === 'absent').length;
    const empLate = employeeAttendance.filter(r => r.status === 'late').length;
    const empAttendanceTotal = employeeAttendance.length;

    const employeeTasks = await Task.countDocuments({ assignedTo: req.user.id, status: { $ne: 'completed' } });
    
    const employeeFunds = await FundRequest.countDocuments({ requestedBy: req.user.name, status: 'pending' });
    const employeeInv = await InventoryRequest.countDocuments({ requestedBy: req.user.name, status: 'pending' });
    const employeePendingRequests = employeeFunds + employeeInv;

    const branchInventoryDocs = await Product.find({ branch: req.user.branch });
    const branchInventory = branchInventoryDocs.reduce((acc, p) => acc + (p.availableQuantity || 0), 0);

    // Lead stats
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'new' });
    const qualifiedLeads = await Lead.countDocuments({ status: 'qualified' });
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });

    res.json({
      admin: {
        totalCountries,
        totalBranches,
        totalEmployees,
        totalOrders,
        totalInventory,
        pendingRequests,
        leadStats: { totalLeads, newLeads, qualifiedLeads, convertedLeads },
        financeSummary: { budget, expenses, income, balance },
        revenueSummary: { currentMonth: income, previousMonth: income * 0.9, growth: income > 0 ? 10 : 0 }
      },
      supervisor: {
        availableBudget,
        pendingRequests: supervisorPendingRequests + supervisorPendingInventory,
        pendingInventory: supervisorPendingInventory,
        assignedTasks: supervisorTasks,
        branchPerformance
      },
      employee: {
        attendance: { present: empPresent, absent: empAbsent, late: empLate, total: empAttendanceTotal },
        assignedTasks: employeeTasks,
        pendingRequests: employeePendingRequests,
        branchInventory
      },
      unreadNotificationsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server and connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });
