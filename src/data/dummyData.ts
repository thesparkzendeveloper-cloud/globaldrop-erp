import type { Country, Branch, Employee, Attendance, Task, Product, Vendor, Transaction, FundRequest, InventoryRequest, Order, Notification } from '@/types';

// All demo data removed — app uses live MongoDB Atlas data only
export const countries: Country[] = [];
export const branches: Branch[] = [];
export const employees: Employee[] = [];
export const mockUser = {
  admin: { id: '', name: '', email: '', role: 'admin' as const, branch: '', country: '' },
  supervisor: { id: '', name: '', email: '', role: 'supervisor' as const, branch: '', country: '' },
  employee: { id: '', name: '', email: '', role: 'employee' as const, branch: '', country: '' },
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
