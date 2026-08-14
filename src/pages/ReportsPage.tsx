import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Package, DollarSign, Clock } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDb } from '@/context/DbContext';

const tabs = [
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'performance', label: 'Performance', icon: Users },
  { id: 'budget', label: 'Budget', icon: BarChart3 },
];

export default function ReportsPage() {
  const { transactions = [], products: inventory = [], attendanceRecords = [], tasks = [] } = useDb();
  const [activeTab, setActiveTab] = useState('revenue');

  // Revenue analytics calculations
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const monthlyAvg = totalIncome / 6;

  // Inventory calculations
  const totalProductsCount = inventory.length;
  const totalInventoryValue = inventory.reduce((acc, p) => acc + (p.sellingPrice || 0) * (p.availableQuantity || 0), 0);
  const lowStockCount = inventory.filter(p => (p.availableQuantity || 0) <= 20).length;
  const outOfStockCount = inventory.filter(p => (p.availableQuantity || 0) === 0).length;

  // Attendance calculations
  const totalAttendance = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const avgAttendanceRate = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : '0';

  // Task performance per employee
  const employeeTaskMap: Record<string, { name: string; tasks: number; completed: number }> = {};
  tasks.forEach(t => {
    const key = t.assignedToName || t.assignedTo || 'Unassigned';
    if (!employeeTaskMap[key]) {
      employeeTaskMap[key] = { name: key, tasks: 0, completed: 0 };
    }
    employeeTaskMap[key].tasks += 1;
    if (t.status === 'completed') {
      employeeTaskMap[key].completed += 1;
    }
  });
  const employeePerformance = Object.values(employeeTaskMap)
    .map(item => ({
      name: item.name,
      tasks: item.tasks,
      completed: item.completed,
      efficiency: item.tasks > 0 ? Math.round((item.completed / item.tasks) * 100) : 0,
    }))
    .slice(0, 5);

  // Budget calculations
  const annualBudget = 5000000;
  const usedBudget = totalExpenses;
  const remainingBudget = annualBudget - usedBudget;
  const budgetUsageRate = annualBudget > 0 ? ((usedBudget / annualBudget) * 100).toFixed(1) : '0';

  // Dynamic Chart calculations:
  // 1. revenueData
  const getRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const curDate = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curDate.getFullYear(), curDate.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      const monthTx = transactions.filter(t => {
        if (!t.date) return false;
        const txDate = new Date(t.date);
        return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
      });
      const rev = monthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const exp = monthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      result.push({ month: monthName, revenue: rev, expenses: exp });
    }
    return result;
  };
  const revenueData = getRevenueData();

  // 2. inventoryOverview
  const getInventoryOverview = () => {
    const categoryMap: Record<string, { category: string; available: number; reserved: number }> = {};
    inventory.forEach(p => {
      const cat = p.category || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, available: 0, reserved: 0 };
      }
      categoryMap[cat].available += (p.availableQuantity || 0);
      categoryMap[cat].reserved += (p.reservedQuantity || 0);
    });
    return Object.values(categoryMap);
  };
  const inventoryOverview = getInventoryOverview();

  // 3. attendanceByMonth
  const getAttendanceByMonth = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const curDate = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curDate.getFullYear(), curDate.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      const monthRecords = attendanceRecords.filter(r => {
        if (!r.date) return false;
        const recordDate = new Date(r.date);
        return recordDate.getMonth() === d.getMonth() && recordDate.getFullYear() === d.getFullYear();
      });
      const present = monthRecords.filter(r => r.status === 'present').length;
      const late = monthRecords.filter(r => r.status === 'late').length;
      const absent = monthRecords.filter(r => r.status === 'absent').length;
      result.push({ month: monthName, present, absent, late });
    }
    return result;
  };
  const attendanceByMonth = getAttendanceByMonth();

  // 4. budgetUsage
  const getBudgetUsage = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const curDate = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curDate.getFullYear(), curDate.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      const monthTx = transactions.filter(t => {
        if (!t.date) return false;
        const txDate = new Date(t.date);
        return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
      });
      const used = monthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) / 1000;
      result.push({ month: monthName, budget: 500, used });
    }
    return result;
  };
  const budgetUsage = getBudgetUsage();

  return (
    <div className="page-enter">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Reports</h1>
        <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Analytics and insights</p>
      </div>

      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium flex-shrink-0 transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            <tab.icon size={14} className="sm:hidden" />
            <tab.icon size={16} className="hidden sm:block" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'revenue' && (
        <div className="space-y-3 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Total Revenue</p>
              <p className="text-lg sm:text-2xl font-semibold text-emerald-600">£{totalIncome.toLocaleString()}</p>
            </div>
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Monthly Avg</p>
              <p className="text-lg sm:text-2xl font-semibold text-slate-800">£{monthlyAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Growth</p>
              <p className="text-lg sm:text-2xl font-semibold text-blue-600">7.5%</p>
            </div>
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Net Profit</p>
              <p className="text-lg sm:text-2xl font-semibold text-violet-600">£{netProfit.toLocaleString()}</p>
            </div>
          </div>
          <div className="card p-3 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Revenue vs Expenses</h3>
            <div className="h-48 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={40} tickFormatter={v => `£${v / 1000}k`} />
                  <Tooltip formatter={(v: any) => `£${v.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#6ee7b7" fillOpacity={0.4} name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#fca5a5" fillOpacity={0.4} name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-3 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Products</p>
              <p className="text-lg sm:text-2xl font-semibold text-slate-800">{totalProductsCount.toLocaleString()}</p>
            </div>
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Value</p>
              <p className="text-lg sm:text-2xl font-semibold text-emerald-600">£{totalInventoryValue.toLocaleString()}</p>
            </div>
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Low Stock</p>
              <p className="text-lg sm:text-2xl font-semibold text-amber-600">{lowStockCount}</p>
            </div>
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Out of Stock</p>
              <p className="text-lg sm:text-2xl font-semibold text-red-600">{outOfStockCount}</p>
            </div>
          </div>
          <div className="card p-3 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">By Category</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryOverview}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={30} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="available" fill="#10b981" name="Available" />
                  <Bar dataKey="reserved" fill="#3b82f6" name="Reserved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-3 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Avg Rate</p>
              <p className="text-lg sm:text-2xl font-semibold text-emerald-600">{avgAttendanceRate}%</p>
            </div>
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Present</p>
              <p className="text-lg sm:text-2xl font-semibold text-slate-800">{presentCount}</p>
            </div>
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Late</p>
              <p className="text-lg sm:text-2xl font-semibold text-amber-600">{lateCount}</p>
            </div>
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Absent</p>
              <p className="text-lg sm:text-2xl font-semibold text-red-600">{absentCount}</p>
            </div>
          </div>
          <div className="card p-3 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Monthly Trend</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={30} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" />
                  <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} name="Late" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

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
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="tasks" fill="#94a3b8" name="Total" />
                  <Bar dataKey="completed" fill="#10b981" name="Done" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-3 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Annual</p>
              <p className="text-lg sm:text-2xl font-semibold text-slate-800">£{annualBudget.toLocaleString()}</p>
            </div>
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Used</p>
              <p className="text-lg sm:text-2xl font-semibold text-blue-600">£{usedBudget.toLocaleString()}</p>
            </div>
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Remaining</p>
              <p className="text-lg sm:text-2xl font-semibold text-emerald-600">£{remainingBudget.toLocaleString()}</p>
            </div>
            <div className="card p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-slate-500">Usage</p>
              <p className="text-lg sm:text-2xl font-semibold text-violet-600">{budgetUsageRate}%</p>
            </div>
          </div>
          <div className="card p-3 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Budget vs Actual</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={budgetUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={35} />
                  <Tooltip formatter={(v: any) => `£${v}k`} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="budget" stroke="#94a3b8" fill="#f1f5f9" fillOpacity={0.6} name="Budget (£k)" />
                  <Area type="monotone" dataKey="used" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.6} name="Used (£k)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
