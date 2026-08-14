import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ClipboardList,
  Package,
  Calendar,
  LogIn,
  LogOut,
  Plus,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDb } from '@/context/DbContext';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    dashboardStats,
    tasks,
    attendanceRecords,
    products,
    checkInEmployee,
    checkOutEmployee,
    addFundRequest,
    addInventoryRequest
  } = useDb();

  const stats = dashboardStats?.employee || {
    attendance: { present: 0, absent: 0, late: 0, total: 0 },
    assignedTasks: 0,
    pendingRequests: 0,
    branchInventory: 0
  };

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceRecords.find(r => r.employeeId === user?.id && r.date === today);
  const checkedIn = !!todayRecord;
  const checkedOut = !!todayRecord?.checkOut;

  // Form States
  const [fundAmount, setFundAmount] = useState('');
  const [fundReason, setFundReason] = useState('');
  const [invProduct, setInvProduct] = useState('');
  const [invQty, setInvQty] = useState('');
  const [invReason, setInvReason] = useState('');

  const handleCheckIn = async () => {
    if (!user) return;
    try {
      await checkInEmployee(user.id, user.name);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    try {
      await checkOutEmployee(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fundAmount || !fundReason) return;
    try {
      await addFundRequest({
        amount: parseFloat(fundAmount),
        reason: fundReason,
        requestedBy: user.name,
        requestDate: today,
        status: 'pending'
      });
      setFundAmount('');
      setFundReason('');
      alert('Fund request submitted successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !invProduct || !invQty || !invReason) return;
    try {
      await addInventoryRequest({
        product: invProduct,
        quantity: parseInt(invQty),
        reason: invReason,
        requestedBy: user.name,
        requestDate: today,
        status: 'pending',
        fromBranch: user.branch || 'Branch A',
        toBranch: 'Main Warehouse'
      });
      setInvProduct('');
      setInvQty('');
      setInvReason('');
      alert('Inventory request submitted successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const myTasks = tasks.filter(t => t.assignedTo === user?.id);
  const myAttendance = attendanceRecords.filter(r => r.employeeId === user?.id).slice(0, 5);

  return (
    <div className="page-enter">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Employee Dashboard</h1>
        <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm sm:text-base">Welcome back, {user?.name}! Track your work and manage requests.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {/* Attendance Status Card */}
        <div className="card p-3 sm:p-4 lg:p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between cursor-pointer" onClick={() => navigate('/attendance')}>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">Today's Status →</p>
              <p className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mt-0.5 sm:mt-1 truncate">
                {checkedOut ? 'Checked Out' : checkedIn ? 'Checked In' : 'Not Checked In'}
              </p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex-shrink-0">
              <Clock size={16} className="text-white sm:hidden" />
              <Clock size={20} className="text-white hidden sm:block" />
            </div>
          </div>
          <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            <button onClick={handleCheckIn} className="btn-primary flex-1 justify-center text-xs sm:text-sm py-1.5 sm:py-2" disabled={checkedIn}>
              <LogIn size={14} className="sm:hidden" />
              <LogIn size={16} className="hidden sm:block" />
              <span className="ml-1">In</span>
            </button>
            <button onClick={handleCheckOut} className="btn-secondary flex-1 justify-center text-xs sm:text-sm py-1.5 sm:py-2" disabled={!checkedIn || checkedOut}>
              <LogOut size={14} className="sm:hidden" />
              <LogOut size={16} className="hidden sm:block" />
              <span className="ml-1">Out</span>
            </button>
          </div>
        </div>

        {/* Assigned Tasks Card */}
        <div
          onClick={() => navigate('/tasks')}
          className="card p-3 sm:p-4 lg:p-5 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500 group-hover:text-blue-600 font-medium transition-colors">Assigned Tasks →</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-blue-600 mt-0.5 sm:mt-1">{myTasks.length}</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
              <ClipboardList size={16} className="text-white sm:hidden" />
              <ClipboardList size={20} className="text-white hidden sm:block" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 sm:mt-3">{myTasks.filter(t => t.status !== 'completed').length} pending</p>
        </div>

        {/* Pending Requests Card */}
        <div
          onClick={() => navigate('/notifications')}
          className="card p-3 sm:p-4 lg:p-5 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500 group-hover:text-amber-600 font-medium transition-colors">Pending Requests →</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-amber-600 mt-0.5 sm:mt-1">{stats.pendingRequests}</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex-shrink-0">
              <Calendar size={16} className="text-white sm:hidden" />
              <Calendar size={20} className="text-white hidden sm:block" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 sm:mt-3">Awaiting approval</p>
        </div>

        {/* Branch Stock Card */}
        <div
          className="card p-3 sm:p-4 lg:p-5 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500">Branch Stock</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-violet-600 mt-0.5 sm:mt-1">{stats.branchInventory}</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex-shrink-0">
              <Package size={16} className="text-white sm:hidden" />
              <Package size={20} className="text-white hidden sm:block" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 sm:mt-3">Items at {user?.branch || 'your branch'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mt-3 sm:mt-4 lg:mt-6">
        <div className="card p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800">My Tasks</h3>
            <button onClick={() => navigate('/tasks')} className="text-xs text-blue-600 hover:underline font-medium">View all →</button>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {myTasks.length === 0 ? (
              <p className="text-slate-500 text-sm">No tasks assigned to you.</p>
            ) : (
              myTasks.map(task => (
                <div key={task.id} className="p-3 sm:p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">{task.title}</p>
                    <span className={`badge text-xs ${task.priority === 'high' ? 'badge-red' : task.priority === 'medium' ? 'badge-yellow' : 'badge-slate'}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Due: {task.dueDate}</span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-16 sm:w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${task.progress}%` }} />
                      </div>
                      <span className="w-8 text-right">{task.progress}%</span>
                    </div>
                  </div>
                  {task.status !== 'completed' && (
                    <button onClick={() => navigate('/tasks')} className="btn-secondary text-xs py-1 mt-2 sm:mt-3 w-full justify-center">
                      Update Status
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <span className="badge-green w-full justify-center py-1.5 mt-2 sm:mt-3 text-xs">
                      <CheckCircle size={12} className="mr-1" /> Completed
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800">Attendance History</h3>
            <button onClick={() => navigate('/attendance')} className="text-xs text-blue-600 hover:underline font-medium">View all →</button>
          </div>
          <div className="space-y-2">
            {myAttendance.length === 0 ? (
              <p className="text-slate-500 text-sm">No attendance records found.</p>
            ) : (
              myAttendance.map((record, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-700">
                      {record.date}
                    </p>
                    <p className="text-xs text-slate-500">
                      {record.checkIn || '--:--'} - {record.checkOut || '--:--'}
                    </p>
                  </div>
                  <span className={`badge text-xs ${record.status === 'present' ? 'badge-green' : record.status === 'late' ? 'badge-yellow' : 'badge-red'}`}>
                    {record.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mt-3 sm:mt-4 lg:mt-6">
        <form onSubmit={handleFundSubmit} className="card p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Request Fund</h3>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="form-label text-xs sm:text-sm">Amount</label>
              <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="Enter amount" className="form-input text-sm" required />
            </div>
            <div>
              <label className="form-label text-xs sm:text-sm">Reason</label>
              <textarea value={fundReason} onChange={e => setFundReason(e.target.value)} placeholder="Enter reason for fund request" className="form-input text-sm" rows={2} required />
            </div>
            <button type="submit" className="btn-primary w-full justify-center text-sm">
              Submit Request
            </button>
          </div>
        </form>

        <form onSubmit={handleInvSubmit} className="card p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Request Inventory</h3>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="form-label text-xs sm:text-sm">Product</label>
              <select value={invProduct} onChange={e => setInvProduct(e.target.value)} className="form-input text-sm" required>
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label text-xs sm:text-sm">Quantity</label>
              <input type="number" value={invQty} onChange={e => setInvQty(e.target.value)} placeholder="Enter quantity" className="form-input text-sm" required />
            </div>
            <div>
              <label className="form-label text-xs sm:text-sm">Reason</label>
              <textarea value={invReason} onChange={e => setInvReason(e.target.value)} placeholder="Enter reason for inventory transfer" className="form-input text-sm" rows={2} required />
            </div>
            <button type="submit" className="btn-primary w-full justify-center text-sm">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
