import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe2,
  Building2,
  Users,
  ShoppingCart,
  Package,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Target,
  CheckCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useDb } from '@/context/DbContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    countries = [],
    branches = [],
    employees = [],
    products: inventory = [],
    orders = [],
    transactions = [],
    fundRequests = [],
    inventoryRequests = [],
    leads = [],
  } = useDb();

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalBalance = totalIncome - totalExpense;
  const totalStock = inventory.reduce((acc, p) => acc + (p.availableQuantity || 0), 0);
  const totalPending = fundRequests.filter(r => r.status === 'pending').length + inventoryRequests.filter(r => r.status === 'pending').length;

  const stats = {
    totalCountries: countries.length,
    totalBranches: branches.length,
    totalEmployees: employees.length,
    totalOrders: orders.length,
    totalInventory: totalStock,
    pendingRequests: totalPending,
    financeSummary: { budget: 0, expenses: totalExpense, income: totalIncome, balance: totalBalance },
    revenueSummary: { currentMonth: totalIncome, previousMonth: 0, growth: 0 }
  };

  // Live lead counts from local state
  const liveLeadStats = {
    total:     leads.length,
    new:       leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  // 1. Dynamic Revenue & Expenses Chart Data
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
  const dynamicRevenueData = getRevenueData();

  // 2. Dynamic Branch Performance Data
  const getBranchPerformance = () => {
    const performanceMap: Record<string, number> = {};
    branches.forEach(b => {
      performanceMap[b.name] = 0;
    });
    transactions.filter(t => t.type === 'income').forEach(t => {
      const br = t.branch || 'Unknown';
      performanceMap[br] = (performanceMap[br] || 0) + t.amount;
    });
    return Object.entries(performanceMap).map(([branch, revenue]) => ({
      branch,
      revenue
    }));
  };
  const dynamicBranchPerformance = getBranchPerformance();

  // 3. Dynamic Employee Growth Data
  const getEmployeeGrowth = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const curDate = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curDate.getFullYear(), curDate.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      
      const count = employees.filter(e => {
        if (!e.joinDate) return true;
        const jDate = new Date(e.joinDate);
        return jDate <= new Date(d.getFullYear(), d.getMonth() + 1, 0);
      }).length;
      
      result.push({ month: monthName, employees: count });
    }
    return result;
  };
  const dynamicEmployeeGrowth = getEmployeeGrowth();

  // 4. Dynamic Inventory by Category Data
  const getInventoryOverview = () => {
    const categoryMap: Record<string, number> = {};
    inventory.forEach(p => {
      const cat = p.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + (p.availableQuantity || 0);
    });
    return Object.entries(categoryMap).map(([name, available]) => ({
      name,
      available
    }));
  };
  const dynamicInventoryOverview = getInventoryOverview();

  const StatCard = ({ title, value, icon: Icon, iconColor, trend, path }: any) => (
    <div
      onClick={() => path && navigate(path)}
      className={`card p-3 sm:p-4 lg:p-5 ${path ? 'cursor-pointer hover:shadow-md transition-all group' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-slate-500 group-hover:text-blue-600 font-medium transition-colors">{title} {path ? '→' : ''}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-800 mt-0.5 sm:mt-1 truncate">{value}</p>
          {trend && trend > 0 ? (
            <p className="text-xs mt-0.5 sm:mt-1 flex items-center gap-1 text-emerald-600">
              <TrendingUp size={12} />
              {Math.abs(trend)}%
            </p>
          ) : trend && trend < 0 ? (
            <p className="text-xs mt-0.5 sm:mt-1 flex items-center gap-1 text-red-600">
              <TrendingDown size={12} />
              {Math.abs(trend)}%
            </p>
          ) : null}
        </div>
        <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${iconColor} flex-shrink-0`}>
          <Icon size={16} className="text-white sm:hidden" />
          <Icon size={20} className="text-white hidden sm:block" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm sm:text-base">Welcome back! Here's your organization overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <StatCard title="Total Countries" value={stats.totalCountries} icon={Globe2} iconColor="bg-gradient-to-br from-blue-500 to-blue-600" path="/countries" />
        <StatCard title="Total Branches" value={stats.totalBranches} icon={Building2} iconColor="bg-gradient-to-br from-emerald-500 to-emerald-600" path="/branches" />
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} iconColor="bg-gradient-to-br from-violet-500 to-violet-600" path="/employees" />
        <StatCard title="Total Orders" value={stats.totalOrders.toLocaleString()} icon={ShoppingCart} iconColor="bg-gradient-to-br from-amber-500 to-amber-600" path="/orders" />
        <StatCard title="Total Inventory" value={stats.totalInventory.toLocaleString()} icon={Package} iconColor="bg-gradient-to-br from-rose-500 to-rose-600" path="/inventory" />
        <StatCard title="Pending" value={stats.pendingRequests} icon={Clock} iconColor="bg-gradient-to-br from-orange-500 to-orange-600" path="/approvals" />
        <StatCard title="Revenue" value={`£${(stats.financeSummary.income / 1000).toFixed(1)}k`} icon={DollarSign} iconColor="bg-gradient-to-br from-teal-500 to-teal-600" trend={stats.revenueSummary.growth} path="/finance" />
        <StatCard title="Balance" value={`£${(stats.financeSummary.balance / 1000).toFixed(1)}k`} icon={ArrowUpRight} iconColor="bg-gradient-to-br from-cyan-500 to-cyan-600" path="/finance" />
      </div>

      {/* Lead Pipeline Overview */}
      <div className="card p-3 sm:p-4 lg:p-5 mt-3 sm:mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
            <Target size={16} className="text-blue-600" />
            Lead Pipeline
          </h3>
          <a href="/leads" className="text-xs text-blue-600 hover:underline font-medium">View all →</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'Total Leads',  value: liveLeadStats.total,     color: 'bg-blue-50',   text: 'text-blue-700',   icon: Target },
            { label: 'New',          value: liveLeadStats.new,       color: 'bg-sky-50',    text: 'text-sky-700',    icon: Target },
            { label: 'Qualified',    value: liveLeadStats.qualified, color: 'bg-purple-50', text: 'text-purple-700', icon: TrendingUp },
            { label: 'Converted',    value: liveLeadStats.converted, color: 'bg-green-50',  text: 'text-green-700',  icon: CheckCircle },
          ].map(({ label, value, color, text, icon: Icon }) => (
            <div key={label} className={`${color} rounded-xl p-3 sm:p-4`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={13} className={text} />
                <p className={`text-xs font-medium ${text}`}>{label}</p>
              </div>
              <p className={`text-xl sm:text-2xl font-bold ${text}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-3 sm:mt-4 lg:mt-6">
        <div className="lg:col-span-2 card p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Monthly Revenue & Expenses</h3>
          <div className="h-48 sm:h-56 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} tickFormatter={v => `£${v / 1000}k`} width={45} />
                <Tooltip formatter={(v: any) => `£${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.4} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#10b981" fill="#6ee7b7" fillOpacity={0.4} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Branch Performance</h3>
          <div className="h-48 sm:h-56 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicBranchPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} tickFormatter={v => `£${v / 1000}k`} />
                <YAxis type="category" dataKey="branch" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={55} />
                <Tooltip formatter={(v: any) => `£${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mt-3 sm:mt-4 lg:mt-6">
        <div className="card p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Employee Growth</h3>
          <div className="h-48 sm:h-56 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicEmployeeGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={30} />
                <Tooltip />
                <Bar dataKey="employees" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Inventory by Category</h3>
          <div className="h-48 sm:h-56 lg:h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicInventoryOverview}
                  dataKey="available"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={4}
                >
                  {dynamicInventoryOverview.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-3 sm:p-4 lg:p-6 mt-3 sm:mt-4 lg:mt-6">
        <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Finance Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
            <p className="text-xs sm:text-sm text-blue-600">Budget</p>
            <p className="text-base sm:text-lg lg:text-xl font-semibold text-blue-700 mt-0.5 sm:mt-1">£{(stats.financeSummary.budget / 1000).toFixed(1)}k</p>
          </div>
          <div className="p-3 sm:p-4 bg-emerald-50 rounded-lg sm:rounded-xl">
            <p className="text-xs sm:text-sm text-emerald-600">Income (Revenue)</p>
            <p className="text-base sm:text-lg lg:text-xl font-semibold text-emerald-700 mt-0.5 sm:mt-1">£{(stats.financeSummary.income / 1000).toFixed(1)}k</p>
          </div>
          <div className="p-3 sm:p-4 bg-amber-50 rounded-lg sm:rounded-xl">
            <p className="text-xs sm:text-sm text-amber-600">Expenses</p>
            <p className="text-base sm:text-lg lg:text-xl font-semibold text-amber-700 mt-0.5 sm:mt-1">£{(stats.financeSummary.expenses / 1000).toFixed(1)}k</p>
          </div>
          <div className="p-3 sm:p-4 bg-violet-50 rounded-lg sm:rounded-xl">
            <p className="text-xs sm:text-sm text-violet-600">Balance</p>
            <p className="text-base sm:text-lg lg:text-xl font-semibold text-violet-700 mt-0.5 sm:mt-1">£{(stats.financeSummary.balance / 1000).toFixed(1)}k</p>
          </div>
        </div>
      </div>
    </div>
  );
}
