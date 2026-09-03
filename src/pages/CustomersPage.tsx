import React, { useState } from 'react';
import { Search, Phone, Mail, MapPin, ShoppingCart, Plus, X, Calendar, Package, CheckCircle, Clock, Truck } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import { useAuth } from '@/context/AuthContext';
import type { Customer, Order } from '@/types';

const statusColors: Record<string, string> = { created: 'badge-blue', packed: 'badge-yellow', dispatched: 'badge-purple', delivered: 'badge-green' };
const statusIcons: Record<string, any> = { created: Clock, packed: Package, dispatched: Truck, delivered: CheckCircle };

export default function CustomersPage() {
  const { customers = [], orders = [], branches = [], addCustomer } = useDb();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Add Customer Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [branch, setBranch] = useState(branches[0]?.name || 'India Branch');
  const [submitting, setSubmitting] = useState(false);

  // Helper to compute customer orders
  const getCustomerOrders = (customerName: string, customerPhone?: string) => {
    return orders.filter(o => 
      o.customer.toLowerCase().trim() === customerName.toLowerCase().trim() ||
      (customerPhone && o.customerPhone && o.customerPhone.trim() === customerPhone.trim())
    );
  };

  // Helper to compute customer total spent
  const getCustomerTotalSpent = (customerOrders: Order[]) => {
    return customerOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  };

  const filteredCustomers = customers.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    const matchBranch = filterBranch === 'all' || !c.branch || c.branch === filterBranch;
    return matchSearch && matchBranch;
  });

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        branch: branch || branches[0]?.name || 'India Branch',
        createdAt: new Date().toISOString().split('T')[0]
      });
      setShowAddModal(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCustomerOrders = selectedCustomer ? getCustomerOrders(selectedCustomer.name, selectedCustomer.phone) : [];
  const selectedCustomerTotal = getCustomerTotalSpent(selectedCustomerOrders);

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Customers</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Manage customer profiles and view their complete order history</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs sm:text-sm">
          <Plus size={16} /> <span>Add Customer</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 sm:mb-6">
        <div className="card p-4">
          <p className="text-xs text-slate-500 font-medium">Total Customers</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">{customers.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 font-medium">Total Customer Orders</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{orders.length}</p>
        </div>
        {isAdmin && (
          <div className="card p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-500 font-medium">Total Customer Revenue</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
              ₹{orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Filter and Search */}
      <div className="card p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Customer Name, Phone, or Email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-8 sm:pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="form-input w-36">
              <option value="all">All Branches</option>
              {branches.filter(b => b.status === 'active').map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="table-header">Customer Name</th>
              <th className="table-header">Contact Information</th>
              <th className="table-header hidden md:table-cell">Branch</th>
              <th className="table-header text-center">Orders Placed</th>
              {isAdmin && <th className="table-header text-right">Total Spent</th>}
              <th className="table-header text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-cell text-center text-slate-400 py-6">No customers found.</td>
              </tr>
            ) : (
              filteredCustomers.map(customer => {
                const custOrders = getCustomerOrders(customer.name, customer.phone);
                const totalSpent = getCustomerTotalSpent(custOrders);

                return (
                  <tr
                    key={customer.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="table-cell font-semibold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{customer.name}</p>
                          <p className="text-xs text-slate-400 font-normal">ID: {customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-xs text-slate-600">
                      <div className="space-y-0.5">
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <Phone size={12} className="text-slate-400" /> {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Mail size={12} className="text-slate-400" /> {customer.email}
                          </div>
                        )}
                        {!customer.phone && !customer.email && <span className="text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell text-xs text-slate-600">
                      {customer.branch || 'Global'}
                    </td>
                    <td className="table-cell text-center font-semibold text-blue-600">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        {custOrders.length} orders
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="table-cell text-right font-bold text-emerald-600">
                        ₹{totalSpent.toLocaleString()}
                      </td>
                    )}
                    <td className="table-cell text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                        }}
                        className="btn-secondary text-xs px-2.5 py-1"
                      >
                        View Orders
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content p-4 sm:p-6 max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Add New Customer</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="form-input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="form-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="form-input w-full text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Branch</label>
                <select value={branch} onChange={e => setBranch(e.target.value)} className="form-input w-full text-xs">
                  {branches.filter(b => b.status === 'active').map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                <textarea
                  rows={2}
                  placeholder="Customer address details..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="form-input w-full text-xs"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3.5 py-1.5 text-xs border rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting || !name.trim()} className="btn-primary text-xs">{submitting ? 'Adding...' : 'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Orders Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content p-4 sm:p-6 max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  {selectedCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{selectedCustomer.name}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    {selectedCustomer.phone && <span className="flex items-center gap-1"><Phone size={12} /> {selectedCustomer.phone}</span>}
                    {selectedCustomer.email && <span className="flex items-center gap-1"><Mail size={12} /> {selectedCustomer.email}</span>}
                    <span className="flex items-center gap-1"><MapPin size={12} /> {selectedCustomer.branch || 'Main Branch'}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>

            {/* Customer Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Total Orders</p>
                <p className="text-lg font-bold text-blue-600 mt-0.5">{selectedCustomerOrders.length}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Delivered Orders</p>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">
                  {selectedCustomerOrders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              {isAdmin && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                  <p className="text-xs text-slate-500 font-medium">Total Amount Spent</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">₹{selectedCustomerTotal.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Customer Orders List */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Orders History ({selectedCustomerOrders.length})</h3>

              {selectedCustomerOrders.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                  <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No orders found for this customer yet.</p>
                </div>
              ) : (
                selectedCustomerOrders.map(order => {
                  return (
                    <div key={order.id} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600 text-sm">{order.id}</span>
                          <span className={statusColors[order.status]}>{order.status}</span>
                        </div>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <Calendar size={12} className="text-slate-400" /> {order.createdAt || order.deadline || ''}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="bg-slate-50 p-2.5 rounded-lg space-y-1 text-xs">
                        {order.products.map((p, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span>{p.name} <span className="text-slate-400 font-medium">x {p.quantity}</span></span>
                            {isAdmin && <span className="font-semibold text-slate-800">₹{(p.price * p.quantity).toLocaleString()}</span>}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Branch: <strong className="text-slate-700">{order.branch}</strong></span>
                        {isAdmin && (
                          <span className="text-sm font-bold text-slate-900">
                            Total: ₹{order.totalAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 pt-3 border-t flex justify-end">
              <button onClick={() => setSelectedCustomer(null)} className="btn-primary text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
