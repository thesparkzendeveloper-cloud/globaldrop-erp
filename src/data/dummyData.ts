import type { Country, Branch, Employee, Attendance, Task, Product, Vendor, Transaction, FundRequest, InventoryRequest, Order, Notification } from '@/types';

// Fallback countries — used when DB is empty or not yet seeded
export const countries: Country[] = [
  { id: 'c0', name: 'India',          code: 'IN', currency: 'INR', timezone: 'Asia/Kolkata',       status: 'active'   },
  { id: 'c1', name: 'United States',  code: 'US', currency: 'USD', timezone: 'America/New_York',   status: 'active'   },
  { id: 'c2', name: 'United Kingdom', code: 'UK', currency: 'GBP', timezone: 'Europe/London',      status: 'active'   },
  { id: 'c3', name: 'Germany',        code: 'DE', currency: 'EUR', timezone: 'Europe/Berlin',      status: 'active'   },
  { id: 'c4', name: 'Japan',          code: 'JP', currency: 'JPY', timezone: 'Asia/Tokyo',         status: 'active'   },
  { id: 'c5', name: 'Australia',      code: 'AU', currency: 'AUD', timezone: 'Australia/Sydney',   status: 'active'   },
  { id: 'c6', name: 'Canada',         code: 'CA', currency: 'CAD', timezone: 'America/Toronto',    status: 'active'   },
  { id: 'c7', name: 'France',         code: 'FR', currency: 'EUR', timezone: 'Europe/Paris',       status: 'inactive' },
  { id: 'c8', name: 'Singapore',      code: 'SG', currency: 'SGD', timezone: 'Asia/Singapore',    status: 'active'   },
];
export const branches: Branch[] = [
  { id: 'b1', name: 'India Branch', country: 'India', address: 'MG Road, Bengaluru', phone: '+91 80 1234 5678', email: 'india@company.com', status: 'active', manager: 'Rajesh Kumar' }
];
export const employees: Employee[] = [];
export const mockUser = {
  admin: { id: 'EMP001', name: 'John Smith', email: 'john.smith@company.com', role: 'admin' as const, branch: 'India Branch', country: 'India' },
  supervisor: { id: 'EMP002', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'supervisor' as const, branch: 'India Branch', country: 'India' },
  employee: { id: 'EMP006', name: 'Emily Davis', email: 'emily.davis@company.com', role: 'employee' as const, branch: 'India Branch', country: 'India' },
};
export const attendanceRecords: Attendance[] = [];
export const tasks: Task[] = [];
export const products: Product[] = [];
export const vendors: Vendor[] = [];
export const transactions: Transaction[] = [];
export const fundRequests: FundRequest[] = [];
export const inventoryRequests: InventoryRequest[] = [];
export const orders: Order[] = [];
export const notifications: Notification[] = [];
export const revenueData = [];
export const branchPerformance = [];
export const employeeGrowth = [];
export const inventoryOverview = [];
export const leads = [];

export const dashboardStats = {
  admin: {
    totalCountries: 0,
    totalBranches: 0,
    totalEmployees: 0,
    totalOrders: 0,
    totalInventory: 0,
    pendingRequests: 0,
    financeSummary: { budget: 0, expenses: 0, income: 0, balance: 0 },
    revenueSummary: { currentMonth: 0, previousMonth: 0, growth: 0 },
  },
  supervisor: {
    availableBudget: 0,
    pendingRequests: 0,
    pendingInventory: 0,
    assignedTasks: 0,
    branchPerformance: 0,
  },
  employee: {
    attendance: { present: 0, absent: 0, late: 0, total: 0 },
    assignedTasks: 0,
    pendingRequests: 0,
    branchInventory: 0,
  },
};
