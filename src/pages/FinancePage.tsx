import React, { useState } from 'react';
import { Plus, Search, ArrowUpRight, ArrowDownLeft, DollarSign, CreditCard, Wallet, TrendingUp, X } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import { useAuth } from '@/context/AuthContext';

export default function FinancePage() {
  const { transactions, branches, addTransaction, addFundRequest } = useDb();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [showWorkflow, setShowWorkflow] = useState(false);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

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
      branch: user?.branch || 'Headquarters'
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
      requestedBy: 'User',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Finance</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Manage budgets and fund requests</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap">
          <button onClick={() => setShowWorkflow(true)} className="btn-secondary text-xs sm:text-sm whitespace-nowrap">
            <TrendingUp size={16} /> <span className="hidden sm:inline">Workflow</span>
          </button>
          <button onClick={() => setShowFundModal(true)} className="btn-secondary text-xs sm:text-sm whitespace-nowrap">
            <CreditCard size={16} /> <span className="hidden sm:inline">Request</span>
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs sm:text-sm whitespace-nowrap">
            <Plus size={16} /> <span>Add</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg sm:rounded-xl">
              <TrendingUp size={18} className="text-emerald-600 sm:hidden" />
              <TrendingUp size={24} className="text-emerald-600 hidden sm:block" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500">Budget</p>
              <p className="text-base sm:text-lg lg:text-2xl font-semibold text-slate-800">£{(5000000 / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
              <ArrowDownLeft size={18} className="text-blue-600 sm:hidden" />
              <ArrowDownLeft size={24} className="text-blue-600 hidden sm:block" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500">Income</p>
              <p className="text-base sm:text-lg lg:text-2xl font-semibold text-blue-600">£{(totalIncome / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg sm:rounded-xl">
              <ArrowUpRight size={18} className="text-red-600 sm:hidden" />
              <ArrowUpRight size={24} className="text-red-600 hidden sm:block" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500">Expenses</p>
              <p className="text-base sm:text-lg lg:text-2xl font-semibold text-red-600">£{(totalExpenses / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-violet-100 rounded-lg sm:rounded-xl">
              <Wallet size={18} className="text-violet-600 sm:hidden" />
              <Wallet size={24} className="text-violet-600 hidden sm:block" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500">Balance</p>
              <p className="text-base sm:text-lg lg:text-2xl font-semibold text-violet-600">£{((totalIncome - totalExpenses) / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </div>
      </div>

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
                    {txn.type === 'income' ? '+' : '-'}£{txn.amount.toLocaleString()}
                  </span>
                </td>
                <td className="table-cell text-slate-500 text-xs">{txn.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showWorkflow && (
        <div className="modal-overlay" onClick={() => setShowWorkflow(false)}>
          <div className="modal-content p-4 sm:p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Fund Workflow</h2>
              <button onClick={() => setShowWorkflow(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {['Employee Request', 'Supervisor Approval', 'Finance Processing'].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">{i + 1}</div>
                  <span className="text-xs sm:text-sm">{s}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button onClick={() => setShowWorkflow(false)} className="btn-secondary flex-1 justify-center">Close</button>
            </div>
          </div>
        </div>
      )}

      {showFundModal && (
        <div className="modal-overlay" onClick={() => setShowFundModal(false)}>
          <form onSubmit={handleRequestFunds} className="modal-content p-4 sm:p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Request Funds</h2>
              <button type="button" onClick={() => setShowFundModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="form-label">Amount</label>
                <input type="number" name="amount" className="form-input" placeholder="£0" required />
              </div>
              <div>
                <label className="form-label">Reason</label>
                <textarea name="reason" className="form-input text-sm" rows={2} required />
              </div>
              <div>
                <label className="form-label">Branch</label>
                <select name="branch" className="form-input" required>
                  {branches.filter(b => b.status === 'active').map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setShowFundModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Submit</button>
            </div>
          </form>
        </div>
      )}

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
                  <input type="number" name="amount" className="form-input" placeholder="£0" required />
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

