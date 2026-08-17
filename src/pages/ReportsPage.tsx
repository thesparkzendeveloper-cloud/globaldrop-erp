import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Package, DollarSign, Clock, Download, ArrowDownLeft, ArrowUpRight, FileSpreadsheet } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDb } from '@/context/DbContext';

const tabs = [
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'performance', label: 'Performance', icon: Users },
];

// ── Excel / CSV export helper ─────────────────────────────
function exportToExcel(rows: Record<string, any>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { transactions = [], products: inventory = [], attendanceRecords = [], tasks = [] } = useDb();
  const [activeTab, setActiveTab] = useState('finance');

  // Finance filter state
  const [financeType, setFinanceType] = useState<'all' | 'income' | 'expense'>('all');
  const [financeFrom, setFinanceFrom] = useState('');
  const [financeTo, setFinanceTo] = useState('');

  // ── Finance report data ─────────────────────────
  const filteredTxns = transactions.filter(t => {
    const matchType = financeType === 'all' || t.type === financeType;
    const matchFrom = !financeFrom || t.date >= financeFrom;
    const matchTo = !financeTo || t.date <= financeTo;
    return matchType && matchFrom && matchTo;
  });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const monthlyAvg = totalIncome / 6;

  // Inventory
  const totalProductsCount = inventory.length;
  const totalInventoryValue = inventory.reduce((acc, p) => acc + (p.sellingPrice || 0) * (p.availableQuantity || 0), 0);
  const lowStockCount = inventory.filter(p => (p.availableQuantity || 0) <= 20).length;
  const outOfStockCount = inventory.filter(p => (p.availableQuantity || 0) === 0).length;

  // Attendance
  const totalAttendance = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const avgAttendanceRate = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : '0';

  // Task performance
  const employeeTaskMap: Record<string, { name: string; tasks: number; completed: number }> = {};
  tasks.forEach(t => {
    const key = t.assignedToName || t.assignedTo || 'Unassigned';
    if (!employeeTaskMap[key]) employeeTaskMap[key] = { name: key, tasks: 0, completed: 0 };
    employeeTaskMap[key].tasks += 1;
    if (t.status === 'completed') employeeTaskMap[key].completed += 1;
  });
  const employeePerformance = Object.values(employeeTaskMap)
    .map(item => ({ name: item.name, tasks: item.tasks, completed: item.completed, efficiency: item.tasks > 0 ? Math.round((item.completed / item.tasks) * 100) : 0 }))
    .slice(0, 5);

  // Revenue chart
  const getRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const curDate = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(curDate.getFullYear(), curDate.getMonth() - (5 - i), 1);
      const monthTx = transactions.filter(t => {
        if (!t.date) return false;
        const td = new Date(t.date);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
      });
      return {
        month: months[d.getMonth()],
        revenue: monthTx.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0),
        expenses: monthTx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
      };
    });
  };
  const revenueData = getRevenueData();

  // Inventory chart
  const getInventoryOverview = () => {
    const cat: Record<string, { category: string; available: number; reserved: number }> = {};
    inventory.forEach(p => {
      const c = p.category || 'General';
      if (!cat[c]) cat[c] = { category: c, available: 0, reserved: 0 };
      cat[c].available += (p.availableQuantity || 0);
      cat[c].reserved += (p.reservedQuantity || 0);
    });
    return Object.values(cat);
  };
  const inventoryOverview = getInventoryOverview();

  // Attendance chart
  const getAttendanceByMonth = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const curDate = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(curDate.getFullYear(), curDate.getMonth() - (5 - i), 1);
      const recs = attendanceRecords.filter(r => {
        if (!r.date) return false;
        const rd = new Date(r.date);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      });
      return {
        month: months[d.getMonth()],
        present: recs.filter(r => r.status === 'present').length,
        late: recs.filter(r => r.status === 'late').length,
        absent: recs.filter(r => r.status === 'absent').length,
      };
    });
  };
  const attendanceByMonth = getAttendanceByMonth();

  // ── Excel download for Finance ──────────────────
  const handleDownload = () => {
    const rows = filteredTxns.map(t => ({
      'ID': t.id,
      'Date': t.date,
      'Type': t.type,
      'Category': t.category,
      'Description': t.description,
      'Amount (₹)': t.amount,
      'Branch': t.branch || '',
      'Created By': t.createdBy || '',
    }));

    // Summary rows at the bottom
    const totalFilteredIncome = filteredTxns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const totalFilteredExpense = filteredTxns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    rows.push({} as any);
    rows.push({ 'ID': 'SUMMARY', 'Date': '', 'Type': '', 'Category': '', 'Description': 'Total Income', 'Amount (₹)': totalFilteredIncome, 'Branch': '', 'Created By': '' });
    rows.push({ 'ID': '', 'Date': '', 'Type': '', 'Category': '', 'Description': 'Total Expense', 'Amount (₹)': totalFilteredExpense, 'Branch': '', 'Created By': '' });
    rows.push({ 'ID': '', 'Date': '', 'Type': '', 'Category': '', 'Description': 'Net Profit', 'Amount (₹)': totalFilteredIncome - totalFilteredExpense, 'Branch': '', 'Created By': '' });

    const typeLabel = financeType === 'all' ? 'All' : financeType.charAt(0).toUpperCase() + financeType.slice(1);
    const dateLabel = financeFrom && financeTo ? `_${financeFrom}_to_${financeTo}` : '';
    exportToExcel(rows, `Finance_Report_${typeLabel}${dateLabel}`);
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Reports</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Analytics and insights</p>
        </div>
        {activeTab === 'finance' && (
          <button onClick={handleDownload} className="btn-primary text-xs sm:text-sm w-full sm:w-auto">
            <FileSpreadsheet size={15} /> Download Excel
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium flex-shrink-0 transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <tab.icon size={14} className="sm:hidden" />
            <tab.icon size={16} className="hidden sm:block" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── FINANCE TAB ── */}
      {activeTab === 'finance' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="card p-3 sm:p-5">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft size={14} className="text-emerald-500" />
                <p className="text-xs sm:text-sm text-slate-500">Income</p>
              </div>
              <p className="text-lg sm:text-2xl font-semibold text-emerald-600">₹{totalIncome.toLocaleString()}</p>
            </div>
            <div className="card p-3 sm:p-5">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight size={14} className="text-red-500" />
                <p className="text-xs sm:text-sm text-slate-500">Expense</p>
              </div>
              <p className="text-lg sm:text-2xl font-semibold text-red-600">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div className="card p-3 sm:p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-violet-500" />
                <p className="text-xs sm:text-sm text-slate-500">Net Profit</p>
              </div>
              <p className={`text-lg sm:text-2xl font-semibold ${netProfit >= 0 ? 'text-violet-600' : 'text-red-600'}`}>
                ₹{netProfit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-3 sm:p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Filter Report</p>
            <div className="flex flex-wrap gap-3">
              {/* Type pills */}
              <div className="flex gap-1.5">
                {(['all', 'income', 'expense'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFinanceType(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      financeType === type
                        ? type === 'income' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : type === 'expense' ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'all' ? 'All' : type === 'income' ? '↓ Income' : '↑ Expense'}
                  </button>
                ))}
              </div>
              {/* Date range */}
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <input
                  type="date"
                  value={financeFrom}
                  onChange={e => setFinanceFrom(e.target.value)}
                  className="form-input text-xs flex-1"
                  placeholder="From"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  value={financeTo}
                  onChange={e => setFinanceTo(e.target.value)}
                  className="form-input text-xs flex-1"
                  placeholder="To"
                />
                {(financeFrom || financeTo) && (
                  <button
                    onClick={() => { setFinanceFrom(''); setFinanceTo(''); }}
                    className="text-slate-400 hover:text-red-500 text-xs underline whitespace-nowrap"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Transactions table */}
          <div className="card overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <p className="text-xs sm:text-sm font-medium text-slate-700">
                {filteredTxns.length} transaction{filteredTxns.length !== 1 ? 's' : ''}
                {financeType !== 'all' ? ` · ${financeType}` : ''}
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="table-header">ID</th>
                    <th className="table-header">Date</th>
                    <th className="table-header hidden sm:table-cell">Description</th>
                    <th className="table-header hidden md:table-cell">Category</th>
                    <th className="table-header">Type</th>
                    <th className="table-header text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTxns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="table-cell text-center text-slate-400 py-8">No transactions found.</td>
                    </tr>
                  ) : filteredTxns.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-cell text-xs text-slate-500 font-mono">{t.id}</td>
                      <td className="table-cell text-xs text-slate-600 whitespace-nowrap">{t.date}</td>
                      <td className="table-cell hidden sm:table-cell text-xs text-slate-600 truncate max-w-[160px]">{t.description}</td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="badge-slate text-xs">{t.category}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          t.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {t.type === 'income' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                          {t.type}
                        </span>
                      </td>
                      <td className={`table-cell text-right text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {filteredTxns.length > 0 && (
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                    <tr>
                      <td colSpan={4} className="table-cell text-xs font-semibold text-slate-600 hidden md:table-cell">Total ({filteredTxns.length} rows)</td>
                      <td colSpan={4} className="table-cell text-xs font-semibold text-slate-600 md:hidden">Total</td>
                      <td className="table-cell text-right font-bold text-sm text-slate-800">
                        ₹{filteredTxns.reduce((a, t) => a + (t.type === 'income' ? t.amount : -t.amount), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── REVENUE TAB ── */}
      {activeTab === 'revenue' && (
        <div className="space-y-3 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="card p-3 sm:p-5"><p className="text-xs sm:text-sm text-slate-500">Total Revenue</p><p className="text-lg sm:text-2xl font-semibold text-emerald-600">₹{totalIncome.toLocaleString()}</p></div>
            <div className="card p-3 sm:p-5"><p className="text-xs sm:text-sm text-slate-500">Monthly Avg</p><p className="text-lg sm:text-2xl font-semibold text-slate-800">₹{monthlyAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
            <div className="card p-3 sm:p-5"><p className="text-xs sm:text-sm text-slate-500">Growth</p><p className="text-lg sm:text-2xl font-semibold text-blue-600">7.5%</p></div>
            <div className="card p-3 sm:p-5"><p className="text-xs sm:text-sm text-slate-500">Net Profit</p><p className="text-lg sm:text-2xl font-semibold text-violet-600">₹{netProfit.toLocaleString()}</p></div>
          </div>
          <div className="card p-3 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Revenue vs Expenses</h3>
            <div className="h-48 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={40} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#6ee7b7" fillOpacity={0.4} name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#fca5a5" fillOpacity={0.4} name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── INVENTORY TAB ── */}
      {activeTab === 'inventory' && (
        <div className="space-y-3 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="card p-3 sm:p-5"><p className="text-xs sm:text-sm text-slate-500">Products</p><p className="text-lg sm:text-2xl font-semibold text-slate-800">{totalProductsCount}</p></div>
            <div className="card p-3 sm:p-5"><p className="text-xs sm:text-sm text-slate-500">Value</p><p className="text-lg sm:text-2xl font-semibold text-emerald-600">₹{totalInventoryValue.toLocaleString()}</p></div>
            <div className="card p-3 sm:p-5"><p className="text-xs sm:text-sm text-slate-500">Low Stock</p><p className="text-lg sm:text-2xl font-semibold text-amber-600">{lowStockCount}</p></div>
            <div className="card p-3 sm:p-5"><p className="text-xs sm:text-sm text-slate-500">Out of Stock</p><p className="text-lg sm:text-2xl font-semibold text-red-600">{outOfStockCount}</p></div>
          </div>
          <div className="card p-3 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">By Category</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryOverview}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={30} />
                  <Tooltip /><Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="available" fill="#10b981" name="Available" />
                  <Bar dataKey="reserved" fill="#3b82f6" name="Reserved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── ATTENDANCE TAB ── */}
      {activeTab === 'attendance' && (
        <div className="space-y-3 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="card p-3 sm:p-5"><p className="text-xs sm:text-sm text-slate-500">Avg Rate</p><p className="text-lg sm:text-2xl font-semibold text-emerald-600">{avgAttendanceRate}%</p></div>
            <div className="card p-3 sm:p-5"><p className="text-xs sm:text-sm text-slate-500">Present</p><p className="text-lg sm:text-2xl font-semibold text-slate-800">{presentCount}</p></div>
            <div className="card p-3 sm:p-5"><p className="text-xs sm:text-sm text-slate-500">Late</p><p className="text-lg sm:text-2xl font-semibold text-amber-600">{lateCount}</p></div>
            <div className="card p-3 sm:p-5"><p className="text-xs sm:text-sm text-slate-500">Absent</p><p className="text-lg sm:text-2xl font-semibold text-red-600">{absentCount}</p></div>
          </div>
          <div className="card p-3 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Monthly Trend</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={30} />
                  <Tooltip /><Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" />
                  <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} name="Late" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── PERFORMANCE TAB ── */}
      {activeTab === 'performance' && (
        <div className="card p-3 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Task Completion</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {employeePerformance.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">No tasks completed yet.</div>
              ) : (
                <BarChart data={employeePerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={60} />
                  <Tooltip /><Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="tasks" fill="#94a3b8" name="Total" />
                  <Bar dataKey="completed" fill="#10b981" name="Done" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
