export type UserRole = 'admin' | 'supervisor' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string;
  country?: string;
  avatar?: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  timezone: string;
  status: 'active' | 'inactive';
}

export interface Branch {
  id: string;
  name: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  manager?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  country: string;
  branch: string;
  joinDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  workingHours: string;
  status: 'present' | 'absent' | 'late';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'on-hold' | 'completed';
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  progress: number;
  branch?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  availableQuantity: number;
  reservedQuantity: number;
  branch: string;
  status: 'available' | 'low-stock' | 'out-of-stock';
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  products: string[];
  rating: number;
  status: 'active' | 'inactive';
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  createdBy: string;
  date: string;
  branch?: string;
}

export interface FundRequest {
  id: string;
  amount: number;
  reason: string;
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  remarks?: string;
}

export interface InventoryRequest {
  id: string;
  product: string;
  quantity: number;
  reason: string;
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'transferred';
  fromBranch: string;
  toBranch: string;
}

export interface Order {
  id: string;
  customer: string;
  branch: string;
  products: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: 'created' | 'packed' | 'dispatched' | 'delivered';
  createdAt: string;
  updatedAt: string;
  deadline?: string;
}

export interface Notification {
  id: string;
  type: 'task' | 'inventory' | 'fund' | 'alert' | 'order';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: 'website' | 'social' | 'referral' | 'cold-call' | 'email' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo: string;
  assignedToName: string;
  value: number;
  notes?: string;
  createdAt?: string;
}

