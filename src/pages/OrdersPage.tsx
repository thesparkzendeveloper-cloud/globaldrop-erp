import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, X, Plus, Trash2, Calendar, FileText, Pencil } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import { useAuth } from '@/context/AuthContext';
import type { Order } from '@/types';
import InvoiceModal from '@/components/InvoiceModal';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

const statusSteps = ['created', 'packed', 'dispatched', 'delivered'];
const statusColors: Record<string, string> = { created: 'badge-blue', packed: 'badge-yellow', dispatched: 'badge-purple', delivered: 'badge-green' };
const statusIcons: Record<string, any> = { created: Clock, packed: Package, dispatched: Truck, delivered: CheckCircle };

interface ProductItem {
  name: string;
  quantity: number;
  price: number;
}

// Helper to get date X days from today
const getFutureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export default function OrdersPage() {
  const { orders, branches, products: inventoryProducts, customers = [], employees = [], updateOrder, updateOrderStatus, deleteOrder, addOrder } = useDb();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isAuthorizedToEdit = user?.role === 'admin' || user?.role === 'supervisor';
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [checkedProducts, setCheckedProducts] = useState<Record<string, boolean>>({});

  // Add / Edit Order Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [branch, setBranch] = useState(branches[0]?.name || 'India Branch');
  const [deadline, setDeadline] = useState(getFutureDate(3));
  const [orderStatus, setOrderStatus] = useState<Order['status']>('created');
  const [orderItems, setOrderItems] = useState<ProductItem[]>([
    { name: '', quantity: 1, price: 0 }
  ]);
  const [orderNotes, setOrderNotes] = useState('');
  const [assignedToRole, setAssignedToRole] = useState<string>('all');
  const [assignedToUser, setAssignedToUser] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const isAuthorizedToAdd = user?.role === 'admin' || user?.role === 'supervisor';

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchBranch = filterBranch === 'all' || o.branch === filterBranch;

    // Strict role-based order visibility filter
    let matchVisibility = true;
    if (user?.role === 'supervisor') {
      const roleMatch = !o.assignedToRole || o.assignedToRole === 'all' || o.assignedToRole === 'supervisor';
      const userMatch = !!user?.id && (o.assignedToUser === user.id || o.assignedToUser === user.email || o.assignedToUser === user.name);
      const branchMatch = !!user?.branch && o.branch === user.branch;
      matchVisibility = roleMatch || userMatch || branchMatch;
    } else if (user?.role === 'employee') {
      const roleMatch = !o.assignedToRole || o.assignedToRole === 'all' || o.assignedToRole === 'employee';
      const userMatch = !!user?.id && (o.assignedToUser === user.id || o.assignedToUser === user.email || o.assignedToUser === user.name);
      matchVisibility = roleMatch || userMatch;
    }

    return matchSearch && matchStatus && matchBranch && matchVisibility;
  });

  const StatusTimeline = ({ status }: { status: string }) => {
    const idx = statusSteps.indexOf(status);
    return (
      <div className="flex items-center gap-1 sm:gap-2 mt-3 sm:mt-4">
        {statusSteps.map((s, i) => {
          const Icon = statusIcons[s];
          const done = i < idx;
          const curr = i === idx;
          return (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1 ${done ? 'text-emerald-600' : curr ? 'text-blue-600' : 'text-slate-300'}`}>
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${done ? 'bg-emerald-100' : curr ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  <Icon size={10} />
                </div>
                <span className="text-xs hidden sm:inline">{s}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 ${done ? 'bg-emerald-200' : 'bg-slate-200'}`} />}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const handleUpdateStatus = async (status: Order['status']) => {
    if (!selectedOrder) return;
    try {
      await updateOrderStatus(selectedOrder.id, status);
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingOrder(null);
    setCustomer('');
    setCustomerPhone('');
    setCustomerEmail('');
    setBranch(branches[0]?.name || 'India Branch');
    setDeadline(getFutureDate(3));
    setOrderStatus('created');
    setOrderItems([{ name: '', quantity: 1, price: 0 }]);
    setOrderNotes('');
    setAssignedToRole('all');
    setAssignedToUser('');
    setShowFormModal(true);
  };

  const handleOpenEditModal = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOrder(order);
    setCustomer(order.customer);
    setCustomerPhone(order.customerPhone || '');
    setCustomerEmail(order.customerEmail || '');
    setBranch(order.branch);
    setDeadline(order.deadline || getFutureDate(3));
    setOrderStatus(order.status);
    setOrderItems(order.products.length > 0 ? order.products.map(p => ({ ...p })) : [{ name: '', quantity: 1, price: 0 }]);
    setOrderNotes(order.notes || '');
    setAssignedToRole(order.assignedToRole || 'all');
    setAssignedToUser(order.assignedToUser || '');
    setShowFormModal(true);
  };

  const handleDeleteOrder = async (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete order ${orderId}?`)) {
      try {
        await deleteOrder(orderId);
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
      } catch (err) {
        console.error('Failed to delete order:', err);
      }
    }
  };

  // Add Product Item row
  const handleAddOrderItem = () => {
    setOrderItems(prev => [...prev, { name: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveOrderItem = (index: number) => {
    if (orderItems.length === 1) return;
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, productName: string) => {
    const invItem = inventoryProducts.find(p => p.name.toLowerCase() === productName.toLowerCase());
    const updated = [...orderItems];
    updated[index] = {
      name: productName,
      quantity: updated[index].quantity || 1,
      price: invItem ? invItem.sellingPrice : updated[index].price
    };
    setOrderItems(updated);
  };

  const handleItemChange = (index: number, field: 'name' | 'quantity' | 'price', value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const calculateTotal = () => {
    return orderItems.reduce((acc, item) => acc + ((item.quantity || 0) * (item.price || 0)), 0);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) return;
    const validItems = orderItems.filter(i => i.name.trim() !== '' && i.quantity > 0);
    if (validItems.length === 0) return;

    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const totalAmount = calculateTotal();
      const assignedUserObj = employees.find(emp => emp.id === assignedToUser || emp.email === assignedToUser);
      const assignedToUserName = assignedUserObj ? assignedUserObj.name : '';

      const payload = {
        customer: customer.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        branch: branch || branches[0]?.name || 'India Branch',
        products: validItems,
        totalAmount,
        status: orderStatus,
        deadline: deadline || getFutureDate(3),
        updatedAt: today,
        notes: orderNotes.trim(),
        assignedToRole,
        assignedToUser,
        assignedToUserName
      };

      if (editingOrder) {
        // Update existing order
        await updateOrder(editingOrder.id, payload);
        if (selectedOrder?.id === editingOrder.id) {
          setSelectedOrder(prev => prev ? {
            ...prev,
            ...payload
          } : null);
        }
      } else {
        // Create new order
        await addOrder({
          ...payload,
          createdAt: today
        });
      }

      setShowFormModal(false);
      setEditingOrder(null);
      setCustomer('');
      setCustomerPhone('');
      setCustomerEmail('');
      setOrderItems([{ name: '', quantity: 1, price: 0 }]);
      setDeadline(getFutureDate(3));
      setOrderNotes('');
      setAssignedToRole('all');
      setAssignedToUser('');
    } catch (err) {
      console.error('Failed to save order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Orders</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Track customer orders, item details, edit order info and deadlines</p>
        </div>
        {isAuthorizedToAdd && (
          <button onClick={handleOpenAddModal} className="btn-primary text-xs sm:text-sm">
            <Plus size={16} /> <span>Create Order</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="card p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-8 sm:pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:pb-0">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input flex-1 sm:flex-none sm:w-32">
              <option value="all">All Status</option>
              <option value="created">Created</option>
              <option value="packed">Packed</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
            </select>
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="form-input flex-1 sm:flex-none sm:w-36">
              <option value="all">All Branches</option>
              {branches.filter(b => b.status === 'active').map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        {statusSteps.map(status => {
          const Icon = statusIcons[status];
          const count = orders.filter(o => o.status === status).length;
          return (
            <div key={status} className="card p-3 sm:p-5 cursor-pointer hover:shadow-md" onClick={() => setFilterStatus(status)}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl ${status === 'created' ? 'bg-blue-100' : status === 'packed' ? 'bg-amber-100' : status === 'dispatched' ? 'bg-violet-100' : 'bg-emerald-100'}`}>
                  <Icon size={16} className={status === 'created' ? 'text-blue-600' : status === 'packed' ? 'text-amber-600' : status === 'dispatched' ? 'text-violet-600' : 'text-emerald-600'} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 capitalize">{status}</p>
                  <p className="text-lg sm:text-2xl font-semibold text-slate-800">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="card overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full min-w-[550px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="table-header">Order ID</th>
              <th className="table-header hidden sm:table-cell">Customer</th>
              <th className="table-header hidden lg:table-cell">Branch</th>
              <th className="table-header hidden md:table-cell">Created Date</th>
              <th className="table-header">Deadline</th>
              {isAdmin && <th className="table-header text-right">Amount</th>}
              <th className="table-header">Status</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-cell text-center text-slate-400 py-6">No orders found.</td>
              </tr>
            ) : filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                <td className="table-cell font-semibold text-blue-600">{order.id}</td>
                <td className="table-cell hidden sm:table-cell text-slate-700 text-xs sm:text-sm font-medium truncate">{order.customer}</td>
                <td className="table-cell hidden lg:table-cell text-slate-600 text-xs">{order.branch}</td>
                <td className="table-cell hidden md:table-cell text-xs font-medium text-slate-600 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-blue-500" />
                    {order.createdAt || new Date().toISOString().split('T')[0]}
                  </div>
                </td>
                <td className="table-cell text-xs font-semibold text-amber-700 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-amber-500" />
                    {order.deadline || getFutureDate(3)}
                  </div>
                </td>
                {isAdmin && <td className="table-cell text-right font-semibold">{formatCurrency(order.totalAmount, user?.role)}</td>}
                <td className="table-cell"><span className={statusColors[order.status]}>{order.status}</span></td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                    {isAuthorizedToEdit && (
                      <button
                        onClick={(e) => handleOpenEditModal(order, e)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Order Details"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInvoiceOrder(order);
                        }}
                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Generate Customer Invoice"
                      >
                        <FileText size={15} />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteOrder(order.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Order Form Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content p-4 sm:p-6 max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editingOrder ? `Edit Order (${editingOrder.id})` : 'Create New Order'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  list="existing-customers-list"
                  placeholder="e.g. Acme Corp or Customer Name"
                  value={customer}
                  onChange={e => {
                    const val = e.target.value;
                    setCustomer(val);
                    const match = customers.find(c => c.name.toLowerCase() === val.toLowerCase());
                    if (match) {
                      if (match.phone && !customerPhone) setCustomerPhone(match.phone);
                      if (match.email && !customerEmail) setCustomerEmail(match.email);
                      if (match.branch) setBranch(match.branch);
                    }
                  }}
                  className="form-input w-full"
                />
                <datalist id="existing-customers-list">
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.phone ? `${c.name} (${c.phone})` : c.name}</option>
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Customer Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="form-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Customer Email</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="form-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Branch *</label>
                  <select
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    className="form-input w-full text-xs"
                  >
                    {branches.filter(b => b.status === 'active').map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status *</label>
                  <select
                    value={orderStatus}
                    onChange={e => setOrderStatus(e.target.value as Order['status'])}
                    className="form-input w-full text-xs"
                  >
                    <option value="created">Created</option>
                    <option value="packed">Packed</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Deadline Date *</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="form-input w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-600">Order Items *</label>
                  <button
                    type="button"
                    onClick={handleAddOrderItem}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-1 border rounded-lg bg-slate-50">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded border border-slate-200">
                      <div className="flex-1">
                        <input
                          type="text"
                          list="inventory-product-list"
                          placeholder="Product Name"
                          value={item.name}
                          onChange={e => handleProductSelect(idx, e.target.value)}
                          className="form-input text-xs w-full"
                          required
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="form-input text-xs w-full"
                          required
                        />
                      </div>
                      {isAdmin && (
                        <div className="w-24">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={`Price (${getCurrencySymbol(user?.role)})`}
                            value={item.price}
                            onChange={e => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                            className="form-input text-xs w-full"
                            required
                          />
                        </div>
                      )}
                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOrderItem(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <datalist id="inventory-product-list">
                  {inventoryProducts.map(p => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>

              {/* Target Visibility / Assignment (Admin Only) */}
              {isAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-xs font-semibold text-blue-900 mb-1">Visible To / Target Role *</label>
                    <select
                      value={assignedToRole}
                      onChange={e => setAssignedToRole(e.target.value)}
                      className="form-input w-full text-xs bg-white"
                    >
                      <option value="all">Everyone (All Roles)</option>
                      <option value="supervisor">Supervisor Only</option>
                      <option value="employee">Employee Only</option>
                      <option value="specific">Specific User</option>
                    </select>
                  </div>
                  {assignedToRole === 'specific' && (
                    <div>
                      <label className="block text-xs font-semibold text-blue-900 mb-1">Select Specific User *</label>
                      <select
                        value={assignedToUser}
                        onChange={e => setAssignedToUser(e.target.value)}
                        className="form-input w-full text-xs bg-white"
                      >
                        <option value="">Select User...</option>
                        {employees.filter(emp => emp.status === 'active').map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.role}) - {emp.branch}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Order Notes / Special Instructions</label>
                <textarea
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="Add any special notes or instructions for this order..."
                  className="form-input w-full text-xs"
                  rows={2}
                />
              </div>

              {isAdmin && (
                <div className="pt-3 border-t flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Total Amount:</span>
                  <span className="text-lg font-bold text-slate-900">{formatCurrency(calculateTotal(), user?.role)}</span>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-sm border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !customer.trim()}
                  className="btn-primary"
                >
                  {submitting ? (editingOrder ? 'Saving...' : 'Creating...') : (editingOrder ? 'Save Changes' : 'Create Order')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content p-4 sm:p-6 max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">{selectedOrder.id}</h2>
                <p className="text-xs sm:text-sm font-medium text-blue-600">Customer: {selectedOrder.customer}</p>
                {selectedOrder.customerPhone && (
                  <p className="text-xs text-slate-500">Phone: {selectedOrder.customerPhone}</p>
                )}
                {selectedOrder.customerEmail && (
                  <p className="text-xs text-slate-500">Email: {selectedOrder.customerEmail}</p>
                )}
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>

            {/* Order Details, Created Date, Visibility & Deadline Card */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl mb-4 text-xs sm:text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Branch Location:</span>
                <span className="font-semibold text-slate-800">{selectedOrder.branch}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-600" /> Created Date:
                </span>
                <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-xs">
                  {selectedOrder.createdAt || new Date().toISOString().split('T')[0]}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                  <Calendar size={14} className="text-amber-600" /> Deadline Date:
                </span>
                <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-xs">
                  {selectedOrder.deadline || getFutureDate(3)}
                </span>
              </div>
              {selectedOrder.assignedToRole && (
                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                  <span className="text-slate-700 font-semibold">Visible To:</span>
                  <span className="font-bold text-violet-900 bg-violet-100 px-2 py-0.5 rounded text-xs capitalize">
                    {selectedOrder.assignedToUserName ? `👤 ${selectedOrder.assignedToUserName}` : selectedOrder.assignedToRole === 'supervisor' ? 'Supervisor Only' : selectedOrder.assignedToRole === 'employee' ? 'Employee Only' : 'Everyone'}
                  </span>
                </div>
              )}
            </div>

            {/* Order Notes (if present) */}
            {selectedOrder.notes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4 text-xs sm:text-sm">
                <span className="font-bold text-blue-900 block mb-0.5">📝 Order Notes:</span>
                <span className="text-blue-800 font-medium whitespace-pre-wrap">{selectedOrder.notes}</span>
              </div>
            )}

            {/* Order Products List */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Order Products & Quantity</p>
              <div className="space-y-2">
                {selectedOrder.products.map((p, i) => {
                  const itemKey = `${selectedOrder.id}-${i}`;
                  const isChecked = !!checkedProducts[itemKey];
                  return (
                    <div key={i} className={`flex items-center justify-between p-2.5 sm:p-3 bg-white border ${isChecked ? 'border-emerald-400 bg-emerald-50/40' : 'border-slate-200'} rounded-lg shadow-sm transition-all`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`chk-${itemKey}`}
                          checked={isChecked}
                          onChange={(e) => {
                            setCheckedProducts(prev => ({
                              ...prev,
                              [itemKey]: e.target.checked
                            }));
                          }}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                        <label htmlFor={`chk-${itemKey}`} className="cursor-pointer">
                          <p className={`text-xs sm:text-sm font-semibold transition-colors ${isChecked ? 'text-emerald-600 font-bold' : 'text-slate-800'}`}>
                            {p.name}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">{p.quantity} units</p>
                        </label>
                      </div>
                      {isAdmin && <span className="font-bold text-xs sm:text-sm text-slate-700">{formatCurrency(p.price, user?.role)}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status Timeline</p>
              <StatusTimeline status={selectedOrder.status} />
            </div>

            {isAdmin && (
              <div className="pt-3 sm:pt-4 border-t mt-3 sm:mt-4 flex justify-between">
                <span className="text-xs sm:text-sm text-slate-500">Total Amount</span>
                <span className="text-lg sm:text-xl font-semibold text-slate-900">{formatCurrency(selectedOrder.totalAmount, user?.role)}</span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-slate-100 items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                <select
                  className="form-input text-xs sm:text-sm w-full"
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as any)}
                >
                  <option value="created">Created</option>
                  <option value="packed">Packed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {isAuthorizedToEdit && (
                  <button
                    onClick={() => {
                      const ord = selectedOrder;
                      setSelectedOrder(null);
                      handleOpenEditModal(ord);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Pencil size={15} /> Edit
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setInvoiceOrder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <FileText size={15} /> Invoice
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                    title="Delete Order"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button onClick={() => setSelectedOrder(null)} className="btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
