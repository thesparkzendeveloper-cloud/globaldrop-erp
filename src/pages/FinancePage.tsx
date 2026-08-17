import React, { useState } from 'react';
import { Plus, Search, ArrowUpRight, ArrowDownLeft, CreditCard, Wallet, X, CheckCircle, ShieldCheck, Clock, Send } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import { useAuth } from '@/context/AuthContext';

export default function FinancePage() {
  const { transactions, branches, addTransaction, addFundRequest, fundRequests = [] } = useDb();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Fund calculations
  const approvedAdminFunds = fundRequests.filter(r => r.status === 'approved').reduce((a, r) => a + (r.amount || 0), 0);
  const pendingAdminFunds = fundRequests.filter(r => r.status === 'pending').reduce((a, r) => a + (r.amount || 0), 0);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const netBalance = approvedAdminFunds + totalIncome - totalExpenses;

  const filteredTransactions = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    return matchSearch && matchType;
  });

  const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string) || 0;
    const type = (formData.get('type') as string).toLowerCase() as 'income' | 'expense';

    const txnData = {
      description: formData.get('description') as string,
      amount,
      type,
      category: formData.get('category') as string,
      date: new Date().toISOString().split('T')[0],
      createdBy: user?.name || 'Admin',
      branch: user?.branch || 'India Branch'
    };

    try {
      await addTransaction(txnData);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestFunds = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string) || 0;

    const reqData = {
      amount,
      reason: formData.get('reason') as string,
      branch: formData.get('branch') as string,
      status: 'pending' as const,
      requestedBy: user?.name || 'Supervisor',
      requestDate: new Date().toISOString().split('T')[0]
    };

    try {
      await addFundRequest(reqData);
      setShowFundModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Finance & Fund Management</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">
            {user?.role === 'supervisor'
              ? 'View admin approved funds, branch expenses and submit fund requests'
              : 'Manage transactions, approved funds and fund requests'}
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap">
          <button onClick={() => setShowFundModal(true)} className="btn-secondary text-xs sm:text-sm whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
            <Send size={16} /> Request Admin Funds
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs sm:text-sm whitespace-nowrap">
            <Plus size={16} /> <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        {/* Approved Admin Funds */}
        <div className="card p-3 sm:p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg sm:rounded-xl">
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Admin Funds</p>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 rounded">Approved</span>
              </div>
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-emerald-700">₹{approvedAdminFunds.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
              <ArrowDownLeft size={20} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500">Income (Sales)</p>
              <p className="text-base sm:text-lg lg:text-2xl font-semibold text-blue-600">₹{totalIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg sm:rounded-xl">
              <ArrowUpRight size={20} className="text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500">Expenses</p>
              <p className="text-base sm:text-lg lg:text-2xl font-semibold text-red-600">₹{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Total Net Balance */}
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-violet-100 rounded-lg sm:rounded-xl">
              <Wallet size={20} className="text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500">Available Balance</p>
              <p className={`text-base sm:text-lg lg:text-2xl font-semibold ${netBalance >= 0 ? 'text-violet-600' : 'text-red-600'}`}>
                ₹{netBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Approved Funds & Requests Status Card */}
      <div className="card p-3 sm:p-5 mb-4 sm:mb-6 bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <h2 className="text-sm sm:text-base font-semibold text-slate-800">Admin Approved Funds & Requests Status</h2>
          </div>
          {pendingAdminFunds > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Clock size={12} /> Pending: ₹{pendingAdminFunds.toLocaleString()}
            </span>
          )}
        </div>

        {fundRequests.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">No fund requests yet. Click &quot;Request Admin Funds&quot; to ask for budget.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {fundRequests.map(req => (
              <div key={req.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">₹{req.amount.toLocaleString()}</span>
                    <span className={`badge text-[10px] ${req.status === 'approved' ? 'badge-green' : req.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}>
                      {req.status === 'approved' ? 'Approved by Admin' : req.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">{req.reason}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Branch: {req.branch || 'India Branch'}</span>
                  <span>{req.requestDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions Search and Filters */}
      <div className="card p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-8 sm:pl-10" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-input sm:w-28">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full min-w-[500px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="table-header">ID</th>
              <th className="table-header hidden sm:table-cell">Description</th>
              <th className="table-header hidden md:table-cell">Category</th>
              <th className="table-header text-right">Amount</th>
              <th className="table-header">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.map(txn => (
              <tr key={txn.id} className="hover:bg-slate-50">
                <td className="table-cell font-medium">{txn.id}</td>
                <td className="table-cell hidden sm:table-cell text-slate-600 text-xs sm:text-sm truncate max-w-[150px]">{txn.description}</td>
                <td className="table-cell hidden md:table-cell"><span className="badge-slate">{txn.category}</span></td>
                <td className="table-cell text-right">
                  <span className={txn.type === 'income' ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                  </span>
                </td>
                <td className="table-cell text-slate-500 text-xs">{txn.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Request Funds Modal */}
      {showFundModal && (
        <div className="modal-overlay" onClick={() => setShowFundModal(false)}>
          <form onSubmit={handleRequestFunds} className="modal-content p-4 sm:p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Request Funds from Admin</h2>
              <button type="button" onClick={() => setShowFundModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="form-label">Requested Amount (₹)</label>
                <input type="number" name="amount" className="form-input" placeholder="₹0" required />
              </div>
              <div>
                <label className="form-label">Reason / Justification</label>
                <textarea name="reason" className="form-input text-sm" rows={2} placeholder="Explain why funds are needed..." required />
              </div>
              <div>
                <label className="form-label">Branch</label>
                <select name="branch" className="form-input" required defaultValue={user?.branch || ''}>
                  {branches.filter(b => b.status === 'active').map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setShowFundModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Submit to Admin</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form onSubmit={handleAddTransaction} className="modal-content p-4 sm:p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Add Transaction</h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Type</label>
                  <select name="type" className="form-input">
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Amount</label>
                  <input type="number" name="amount" className="form-input" placeholder="₹0" required />
                </div>
              </div>
              <div>
                <label className="form-label">Category</label>
                <select name="category" className="form-input">
                  <option value="Sales">Sales</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Salary">Salary</option>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities</option>
                </select>
              </div>
              <div>
                <label className="form-label">Description</label>
                <input type="text" name="description" className="form-input" placeholder="Description" required />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
