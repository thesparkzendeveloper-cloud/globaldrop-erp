import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
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
  Lead,
  Customer
} from '@/types';
import * as dummyData from '@/data/dummyData';

interface DbContextType {
  countries: Country[];
  branches: Branch[];
  employees: Employee[];
  attendanceRecords: Attendance[];
  tasks: Task[];
  products: Product[];
  vendors: Vendor[];
  transactions: Transaction[];
  fundRequests: FundRequest[];
  inventoryRequests: InventoryRequest[];
  orders: Order[];
  notifications: Notification[];
  leads: Lead[];
  customers: Customer[];
  settings: any;
  dashboardStats: any;
  loading: boolean;
  refreshData: () => Promise<void>;

  // CRUD Functions
  addCountry: (item: Omit<Country, 'id'>) => Promise<void>;
  updateCountry: (id: string, item: Partial<Country>) => Promise<void>;
  deleteCountry: (id: string) => Promise<void>;

  addBranch: (item: Omit<Branch, 'id'>) => Promise<void>;
  updateBranch: (id: string, item: Partial<Branch>) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;

  addEmployee: (item: Omit<Employee, 'id'> & { id?: string; password?: string }) => Promise<void>;
  updateEmployee: (id: string, item: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  checkInEmployee: (employeeId: string, employeeName: string) => Promise<void>;
  checkOutEmployee: (employeeId: string) => Promise<void>;

  addTask: (item: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, item: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addProduct: (item: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, item: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addVendor: (item: Omit<Vendor, 'id'>) => Promise<void>;
  updateVendor: (id: string, item: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;

  addTransaction: (item: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addFundRequest: (item: Omit<FundRequest, 'id'>) => Promise<void>;
  updateFundRequest: (id: string, item: Partial<FundRequest>) => Promise<void>;

  addInventoryRequest: (item: Omit<InventoryRequest, 'id'>) => Promise<void>;
  updateInventoryRequest: (id: string, item: Partial<InventoryRequest>) => Promise<void>;

  addOrder: (item: Omit<Order, 'id'>) => Promise<void>;
  updateOrder: (id: string, item: Partial<Order>) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  markNotificationRead: (id: string) => Promise<void>;
  addNotification: (item: Omit<Notification, 'id'>) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;

  addLead: (item: Omit<Lead, 'id'>) => Promise<void>;
  updateLead: (id: string, item: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  addCustomer: (item: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: string, item: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_SERVER_API || 'http://localhost:5000/api';

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fundRequests, setFundRequests] = useState<FundRequest[]>([]);
  const [inventoryRequests, setInventoryRequests] = useState<InventoryRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [dashboardStats, setDashboardStats] = useState<any>(dummyData.dashboardStats);
  const [loading, setLoading] = useState(true);

  // Helper to map MongoDB _id to id
  const mapMongoId = (item: any) => {
    if (!item) return item;
    return {
      ...item,
      id: item.id || item._id
    };
  };

  const getHeaders = () => {
    const token = localStorage.getItem('globaldrop_erp_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchData = async () => {
    try {
      const endpoints = [
        'countries', 'branches', 'employees', 'attendance', 'tasks',
        'inventory', 'vendors', 'transactions', 'fund-requests',
        'inventory-requests', 'orders', 'notifications', 'leads', 'customers', 'settings', 'dashboard/stats'
      ];

      const fetchWithTimeout = async (ep: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        try {
          const res = await fetch(`${API_BASE_URL}/${ep}`, {
            headers: getHeaders(),
            signal: controller.signal
          }).catch(() => null);
          clearTimeout(timeoutId);
          if (res && res.ok) {
            return await res.json();
          }
          return null;
        } catch {
          clearTimeout(timeoutId);
          return null;
        }
      };

      const fetchPromises = endpoints.map(ep => fetchWithTimeout(ep));
      const results = await Promise.all(fetchPromises);

      const [
        countriesData, branchesData, employeesData, attendanceData, tasksData,
        productsData, vendorsData, transactionsData, fundRequestsData,
        inventoryRequestsData, ordersData, notificationsData, leadsData, customersData, settingsData, statsData
      ] = results;

      // Helper to resolve state safely without overwriting local changes when API returns null
      const resolveState = <T extends { id?: string }>(
        apiData: any,
        prevData: T[],
        dummyDefault: T[]
      ): T[] => {
        if (Array.isArray(apiData)) {
          const mappedApi = apiData.map(mapMongoId);
          const localItems = prevData.filter(item => item.id && item.id.toString().startsWith('LOCAL_'));
          if (localItems.length > 0) {
            const apiIds = new Set(mappedApi.map((i: any) => i.id));
            const newLocals = localItems.filter(item => !apiIds.has(item.id));
            return [...newLocals, ...mappedApi];
          }
          return mappedApi;
        }
        if (prevData && prevData.length > 0) {
          return prevData;
        }
        return dummyDefault;
      };

      setCountries(prev => resolveState(countriesData, prev, []));
      setBranches(prev => resolveState(branchesData, prev, []));
      setEmployees(prev => resolveState(employeesData, prev, []));
      setAttendanceRecords(prev => resolveState(attendanceData, prev, []));
      setTasks(prev => resolveState(tasksData, prev, []));
      setProducts(prev => resolveState(productsData, prev, []));
      setVendors(prev => resolveState(vendorsData, prev, []));
      setTransactions(prev => resolveState(transactionsData, prev, []));
      setFundRequests(prev => resolveState(fundRequestsData, prev, []));
      setInventoryRequests(prev => resolveState(inventoryRequestsData, prev, []));
      setOrders(prev => resolveState(ordersData, prev, []));
      setNotifications(prev => resolveState(notificationsData, prev, []));
      setLeads(prev => resolveState(leadsData, prev, []));
      setCustomers(prev => resolveState(customersData, prev, []));
      setSettings(settingsData || {
        companyName: 'GlobalDrop ERP',
        email: 'admin@globaldrop.com',
        phone: '+1 (212) 555-0100',
        address: '350 Fifth Avenue, New York, NY 10118',
        taxRate: 15,
        currency: 'INR'
      });
      setDashboardStats(statsData || dummyData.dashboardStats);
    } catch (err) {
      console.error('Error fetching data from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = async () => {
    await fetchData();
  };

  // --- CRUD API ACTIONS ---

  const makeRequest = async (path: string, method: string, body?: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${path}`, {
        method,
        headers: getHeaders(),
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`HTTP error ${response.status}: ${errText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`Request failed for ${path}, using local state fallback:`, error);
      const fallbackId = (body?.id && String(body.id).startsWith('LOCAL_')) ? body.id : ('LOCAL_' + Date.now());
      return { ...body, id: fallbackId };
    }
  };

  // Countries
  const addCountry = async (item: Omit<Country, 'id'>) => {
    const newItem = await makeRequest('countries', 'POST', item);
    setCountries(prev => [mapMongoId(newItem), ...prev]);
    refreshData();
  };
  const updateCountry = async (id: string, item: Partial<Country>) => {
    const updated = await makeRequest(`countries/${id}`, 'PUT', item);
    setCountries(prev => prev.map(c => c.id === id ? mapMongoId(updated) : c));
    refreshData();
  };
  const deleteCountry = async (id: string) => {
    await makeRequest(`countries/${id}`, 'DELETE');
    setCountries(prev => prev.filter(c => c.id !== id));
    refreshData();
  };

  // Branches
  const addBranch = async (item: Omit<Branch, 'id'>) => {
    const newItem = await makeRequest('branches', 'POST', item);
    setBranches(prev => [mapMongoId(newItem), ...prev]);
    refreshData();
  };
  const updateBranch = async (id: string, item: Partial<Branch>) => {
    const updated = await makeRequest(`branches/${id}`, 'PUT', item);
    setBranches(prev => prev.map(b => b.id === id ? mapMongoId(updated) : b));
    refreshData();
  };
  const deleteBranch = async (id: string) => {
    await makeRequest(`branches/${id}`, 'DELETE');
    setBranches(prev => prev.filter(b => b.id !== id));
    refreshData();
  };

  // Employees
  const addEmployee = async (item: Omit<Employee, 'id'> & { id?: string; password?: string }) => {
    // If backend is local, we use a secure route that hashes the password
    const newItem = await makeRequest('employees/secure', 'POST', item);
    setEmployees(prev => [mapMongoId(newItem), ...prev]);
    refreshData();
  };
  const updateEmployee = async (id: string, item: Partial<Employee>) => {
    const updated = await makeRequest(`employees/${id}`, 'PUT', item);
    setEmployees(prev => prev.map(e => e.id === id ? mapMongoId(updated) : e));
    refreshData();
  };
  const deleteEmployee = async (id: string) => {
    await makeRequest(`employees/${id}`, 'DELETE');
    setEmployees(prev => prev.filter(e => e.id !== id));
    refreshData();
  };

  // Attendance
  const checkInEmployee = async (employeeId: string, employeeName: string) => {
    const record = await makeRequest('attendance/check-in', 'POST', { employeeId, employeeName });
    setAttendanceRecords(prev => [mapMongoId(record), ...prev]);
    refreshData();
  };
  const checkOutEmployee = async (employeeId: string) => {
    const record = await makeRequest('attendance/check-out', 'POST', { employeeId });
    setAttendanceRecords(prev => prev.map(r => r.employeeId === employeeId && r.date === record.date ? mapMongoId(record) : r));
    refreshData();
  };

  // Tasks
  const addTask = async (item: Omit<Task, 'id'>) => {
    const newItem = await makeRequest('tasks', 'POST', item);
    setTasks(prev => [mapMongoId(newItem), ...prev]);

    // Automatically notify the assigned user
    if (item.assignedTo) {
      try {
        const notifData = {
          type: 'task',
          title: 'New Task Assigned',
          message: `You have been assigned a new task: "${item.title}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          priority: item.priority || 'medium',
          targetUserId: item.assignedTo
        };
        const newNotif = await makeRequest('notifications', 'POST', notifData);
        setNotifications(prev => [mapMongoId(newNotif), ...prev]);
      } catch (e) {
        console.error('Failed to create task notification', e);
      }
    }

    refreshData();
  };
  const updateTask = async (id: string, item: Partial<Task>) => {
    const updated = await makeRequest(`tasks/${id}`, 'PUT', item);
    setTasks(prev => prev.map(t => t.id === id ? mapMongoId(updated) : t));
    refreshData();
  };
  const deleteTask = async (id: string) => {
    await makeRequest(`tasks/${id}`, 'DELETE');
    setTasks(prev => prev.filter(t => t.id !== id));
    refreshData();
  };

  // Inventory
  const addProduct = async (item: Omit<Product, 'id'>) => {
    const newItem = await makeRequest('inventory', 'POST', item);
    setProducts(prev => [mapMongoId(newItem), ...prev]);
    refreshData();
  };
  const updateProduct = async (id: string, item: Partial<Product>) => {
    const updated = await makeRequest(`inventory/${id}`, 'PUT', item);
    setProducts(prev => prev.map(p => p.id === id ? mapMongoId(updated) : p));
    refreshData();
  };
  const deleteProduct = async (id: string) => {
    await makeRequest(`inventory/${id}`, 'DELETE');
    setProducts(prev => prev.filter(p => p.id !== id));
    refreshData();
  };

  // Vendors
  const addVendor = async (item: Omit<Vendor, 'id'>) => {
    const newItem = await makeRequest('vendors', 'POST', item);
    setVendors(prev => [mapMongoId(newItem), ...prev]);
    refreshData();
  };
  const updateVendor = async (id: string, item: Partial<Vendor>) => {
    const updated = await makeRequest(`vendors/${id}`, 'PUT', item);
    setVendors(prev => prev.map(v => v.id === id ? mapMongoId(updated) : v));
    refreshData();
  };
  const deleteVendor = async (id: string) => {
    await makeRequest(`vendors/${id}`, 'DELETE');
    setVendors(prev => prev.filter(v => v.id !== id));
    refreshData();
  };

  // Transactions
  const addTransaction = async (item: Omit<Transaction, 'id'>) => {
    const txnUniqueId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
    const newItem = await makeRequest('transactions', 'POST', { ...item, id: txnUniqueId });
    setTransactions(prev => [mapMongoId(newItem), ...prev]);
    refreshData();
  };
  const deleteTransaction = async (id: string) => {
    await makeRequest(`transactions/${id}`, 'DELETE');
    setTransactions(prev => prev.filter(t => t.id !== id));
    refreshData();
  };

  // Fund Requests
  const addFundRequest = async (item: Omit<FundRequest, 'id'>) => {
    const newItem = await makeRequest('fund-requests', 'POST', item);
    const mapped = mapMongoId(newItem);
    setFundRequests(prev => [mapped, ...prev]);

    // Create system notification
    try {
      const notifData = {
        type: 'fund' as const,
        title: 'New Fund Request Submitted',
        message: `Fund request of ${item.amount ? '₹' + item.amount : 'amount'} submitted by ${item.requestedBy || 'User'} for "${item.reason || 'Expense'}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        priority: 'high' as const,
        targetUserId: ''
      };
      const newNotif = await makeRequest('notifications', 'POST', notifData);
      setNotifications(prev => [mapMongoId(newNotif), ...prev]);
    } catch (e) {
      console.error(e);
    }

    refreshData();
  };

  const updateFundRequest = async (id: string, item: Partial<FundRequest>) => {
    const updated = await makeRequest(`fund-requests/${id}`, 'PUT', item);
    const mapped = mapMongoId(updated);
    setFundRequests(prev => prev.map(fr => fr.id === id ? mapped : fr));

    if (item.status) {
      try {
        const notifData = {
          type: 'fund' as const,
          title: `Fund Request ${item.status.toUpperCase()}`,
          message: `Fund request for "${mapped.reason || 'Expense'}" requested by ${mapped.requestedBy || 'User'} has been ${item.status}.${item.remarks ? ' Remarks: ' + item.remarks : ''}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          priority: item.status === 'approved' ? ('high' as const) : ('medium' as const),
          targetUserId: ''
        };
        const newNotif = await makeRequest('notifications', 'POST', notifData);
        setNotifications(prev => [mapMongoId(newNotif), ...prev]);
      } catch (e) {
        console.error(e);
      }
    }

    refreshData();
  };

  // Inventory Requests
  const addInventoryRequest = async (item: Omit<InventoryRequest, 'id'>) => {
    const newItem = await makeRequest('inventory-requests', 'POST', item);
    const mapped = mapMongoId(newItem);
    setInventoryRequests(prev => [mapped, ...prev]);

    try {
      const notifData = {
        type: 'inventory' as const,
        title: 'New Inventory Request Submitted',
        message: `${item.requestedBy || 'User'} requested ${item.quantity} units of "${item.product}" for "${item.reason || 'Stock'}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        priority: 'medium' as const,
        targetUserId: ''
      };
      const newNotif = await makeRequest('notifications', 'POST', notifData);
      setNotifications(prev => [mapMongoId(newNotif), ...prev]);
    } catch (e) {
      console.error(e);
    }

    refreshData();
  };

  const updateInventoryRequest = async (id: string, item: Partial<InventoryRequest>) => {
    const updated = await makeRequest(`inventory-requests/${id}`, 'PUT', item);
    const mapped = mapMongoId(updated);
    setInventoryRequests(prev => prev.map(ir => ir.id === id ? mapped : ir));

    if (item.status) {
      try {
        const notifData = {
          type: 'inventory' as const,
          title: `Inventory Request ${item.status.toUpperCase()}`,
          message: `Inventory request for ${mapped.quantity} units of "${mapped.product}" has been ${item.status}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          priority: 'medium' as const,
          targetUserId: ''
        };
        const newNotif = await makeRequest('notifications', 'POST', notifData);
        setNotifications(prev => [mapMongoId(newNotif), ...prev]);
      } catch (e) {
        console.error(e);
      }
    }

    refreshData();
  };

  // Orders
  const addOrder = async (item: Omit<Order, 'id'>) => {
    let maxNum = 0;
    orders.forEach(o => {
      if (o.id && o.id.startsWith('Order No ')) {
        const num = parseInt(o.id.replace('Order No ', ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const formattedId = `Order No ${maxNum + 1}`;
    const newItem = await makeRequest('orders', 'POST', { ...item, id: formattedId });
    const mappedNewItem = mapMongoId(newItem);
    setOrders(prev => [mappedNewItem, ...prev]);

    // Automatically decrease product inventory quantity
    if (item.products && item.products.length > 0) {
      for (const orderItem of item.products) {
        const targetProd = products.find(p => p.name.toLowerCase() === orderItem.name.toLowerCase());
        if (targetProd) {
          const newQty = Math.max(0, targetProd.availableQuantity - orderItem.quantity);
          const newStatus = newQty === 0 ? 'out-of-stock' : newQty <= 50 ? 'low-stock' : 'available';
          await updateProduct(targetProd.id, {
            availableQuantity: newQty,
            status: newStatus
          });
        }
      }
    }

    // Auto-create income transaction in Finance for this order
    if (item.totalAmount && item.totalAmount > 0) {
      const txnId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
      const txnData = {
        id: txnId,
        description: `Order ${mappedNewItem.id || formattedId} — ${item.customer || 'Customer'}`,
        amount: item.totalAmount,
        type: 'income' as const,
        category: 'Sales',
        date: new Date().toISOString().split('T')[0],
        createdBy: 'System',
        branch: item.branch || 'India Branch',
      };
      const newTxn = await makeRequest('transactions', 'POST', txnData);
      setTransactions(prev => [mapMongoId(newTxn), ...prev]);
    }

    // Automatically create or update customer record
    if (item.customer) {
      const existingCustomer = customers.find(c => c.name.toLowerCase() === item.customer.toLowerCase() || (item.customerPhone && c.phone === item.customerPhone));
      if (!existingCustomer) {
        const custId = 'CUST' + Date.now() + Math.floor(Math.random() * 1000);
        const newCustData = {
          id: custId,
          name: item.customer,
          phone: item.customerPhone || '',
          email: item.customerEmail || '',
          branch: item.branch || '',
          createdAt: item.createdAt || new Date().toISOString().split('T')[0]
        };
        makeRequest('customers', 'POST', newCustData).then(newCust => {
          setCustomers(prev => [mapMongoId(newCust || newCustData), ...prev]);
        }).catch(() => {
          setCustomers(prev => [newCustData, ...prev]);
        });
      } else if (item.customerPhone || item.customerEmail) {
        const custUpdated = {
          phone: item.customerPhone || existingCustomer.phone,
          email: item.customerEmail || existingCustomer.email,
          branch: item.branch || existingCustomer.branch
        };
        makeRequest(`customers/${existingCustomer.id}`, 'PUT', custUpdated).catch(() => null);
        setCustomers(prev => prev.map(c => c.id === existingCustomer.id ? { ...c, ...custUpdated } : c));
      }
    }

    // Auto-notify order creation
    try {
      const notifData = {
        type: 'order' as const,
        title: 'New Order Created',
        message: `Order ${mappedNewItem.id || formattedId} for ${item.customer || 'Customer'} has been created. Total: ₹${item.totalAmount}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        priority: 'medium' as const,
        targetUserId: ''
      };
      const newNotif = await makeRequest('notifications', 'POST', notifData);
      setNotifications(prev => [mapMongoId(newNotif), ...prev]);
    } catch (e) {
      console.error(e);
    }

    refreshData();
  };

  const updateOrder = async (id: string, item: Partial<Order>) => {
    const updated = await makeRequest(`orders/${id}`, 'PUT', {
      ...item,
      updatedAt: new Date().toISOString().split('T')[0]
    });
    setOrders(prev => prev.map(o => o.id === id ? mapMongoId(updated) : o));
    refreshData();
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    await updateOrder(id, { status });

    try {
      const notifData = {
        type: 'order' as const,
        title: 'Order Status Updated',
        message: `Order #${id} status has been updated to "${status.toUpperCase()}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        priority: 'medium' as const,
        targetUserId: ''
      };
      const newNotif = await makeRequest('notifications', 'POST', notifData);
      setNotifications(prev => [mapMongoId(newNotif), ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteOrder = async (id: string) => {
    await makeRequest(`orders/${id}`, 'DELETE');
    setOrders(prev => prev.filter(o => o.id !== id));
    refreshData();
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    const updated = await makeRequest(`notifications/${id}`, 'PUT', { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? mapMongoId(updated) : n));
    refreshData();
  };

  const addNotification = async (item: Omit<Notification, 'id'>) => {
    const newItem = await makeRequest('notifications', 'POST', item);
    setNotifications(prev => [mapMongoId(newItem), ...prev]);
    refreshData();
  };

  // Settings
  const updateSettings = async (newSettings: any) => {
    const updated = await makeRequest('settings', 'PUT', newSettings);
    setSettings(updated);
    refreshData();
  };

  // Leads
  const addLead = async (item: Omit<Lead, 'id'>) => {
    const newItem = await makeRequest('leads', 'POST', item);
    setLeads(prev => [mapMongoId(newItem), ...prev]);
    refreshData();
  };
  const updateLead = async (id: string, item: Partial<Lead>) => {
    const updated = await makeRequest(`leads/${id}`, 'PUT', item);
    setLeads(prev => prev.map(l => l.id === id ? mapMongoId(updated) : l));
    refreshData();
  };
  const deleteLead = async (id: string) => {
    await makeRequest(`leads/${id}`, 'DELETE');
    setLeads(prev => prev.filter(l => l.id !== id));
    refreshData();
  };

  // Customers
  const addCustomer = async (item: Omit<Customer, 'id'>) => {
    const randomId = 'CUST' + Math.floor(100 + Math.random() * 900);
    const newItem = await makeRequest('customers', 'POST', { ...item, id: randomId });
    setCustomers(prev => [mapMongoId(newItem), ...prev]);
    refreshData();
  };
  const updateCustomer = async (id: string, item: Partial<Customer>) => {
    const updated = await makeRequest(`customers/${id}`, 'PUT', item);
    setCustomers(prev => prev.map(c => c.id === id ? mapMongoId(updated) : c));
    refreshData();
  };
  const deleteCustomer = async (id: string) => {
    await makeRequest(`customers/${id}`, 'DELETE');
    setCustomers(prev => prev.filter(c => c.id !== id));
    refreshData();
  };

  return (
    <DbContext.Provider
      value={{
        countries,
        branches,
        employees,
        attendanceRecords,
        tasks,
        products,
        vendors,
        transactions,
        fundRequests,
        inventoryRequests,
        orders,
        notifications,
        leads,
        settings,
        dashboardStats,
        loading,
        refreshData,
        addCountry,
        updateCountry,
        deleteCountry,
        addBranch,
        updateBranch,
        deleteBranch,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        checkInEmployee,
        checkOutEmployee,
        addTask,
        updateTask,
        deleteTask,
        addProduct,
        updateProduct,
        deleteProduct,
        addVendor,
        updateVendor,
        deleteVendor,
        addTransaction,
        deleteTransaction,
        addFundRequest,
        updateFundRequest,
        addInventoryRequest,
        updateInventoryRequest,
        addOrder,
        updateOrder,
        updateOrderStatus,
        deleteOrder,
        markNotificationRead,
        addNotification,
        updateSettings,
        addLead,
        updateLead,
        deleteLead,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer
      }}
    >
      {children}
    </DbContext.Provider>
  );
}

export function useDb() {
  const ctx = useContext(DbContext);
  if (!ctx) throw new Error('useDb must be used within DbProvider');
  return ctx;
}
