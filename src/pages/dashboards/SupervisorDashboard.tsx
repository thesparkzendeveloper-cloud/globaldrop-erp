import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Clock,
  Package,
  ClipboardList,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDb } from '@/context/DbContext';

const weeklyData = [
  { day: 'Mon', tasks: 12, completed: 8 },
  { day: 'Tue', tasks: 15, completed: 12 },
  { day: 'Wed', tasks: 10, completed: 7 },
  { day: 'Thu', tasks: 18, completed: 14 },
  { day: 'Fri', tasks: 14, completed: 11 },
  { day: 'Sat', tasks: 5, completed: 5 },
  { day: 'Sun', tasks: 3, completed: 3 },
];

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const { tasks = [], fundRequests = [], inventoryRequests = [], products = [] } = useDb();
  
  const stats = {
    availableBudget: 150000,
    pendingRequests: fundRequests.filter(r => r.status === 'pending').length,
    pendingInventory: inventoryRequests.filter(r => r.status === 'pending').length,
    assignedTasks: tasks.length,
    branchPerformance: 100
  };

  const StatCard = ({ title, value, icon: Icon, bgColor, textColor, path }: any) => (
    <div
      onClick={() => path && navigate(path)}
      className={`card p-3 sm:p-4 lg:p-5 ${path ? 'cursor-pointer hover:shadow-md transition-all group' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-slate-500 group-hover:text-blue-600 font-medium transition-colors">{title} {path ? '→' : ''}</p>
          <p className={`text-lg sm:text-xl lg:text-2xl font-semibold mt-0.5 sm:mt-1 ${textColor} truncate`}>{value}</p>
        </div>
        <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${bgColor} flex-shrink-0`}>
          <Icon size={16} className="text-white sm:hidden" />
          <Icon size={20} className="text-white hidden sm:block" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Supervisor Dashboard</h1>
        <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm sm:text-base">Manage your branch operations and team.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        <StatCard title="Budget" value={`£${(stats.availableBudget / 1000).toFixed(0)}k`} icon={DollarSign} bgColor="bg-gradient-to-br from-emerald-500 to-emerald-600" textColor="text-emerald-600" path="/finance" />
        <StatCard title="Pending" value={stats.pendingRequests} icon={Clock} bgColor="bg-gradient-to-br from-amber-500 to-amber-600" textColor="text-amber-600" path="/approvals" />
        <StatCard title="Inventory" value={stats.pendingInventory} icon={Package} bgColor="bg-gradient-to-br from-blue-500 to-blue-600" textColor="text-blue-600" path="/inventory" />
        <StatCard title="Tasks" value={stats.assignedTasks} icon={ClipboardList} bgColor="bg-gradient-to-br from-violet-500 to-violet-600" textColor="text-violet-600" path="/tasks" />
        <StatCard title="Performance" value={`${stats.branchPerformance}%`} icon={TrendingUp} bgColor="bg-gradient-to-br from-teal-500 to-teal-600" textColor="text-teal-600" path="/reports" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-3 sm:mt-4 lg:mt-6">
        <div className="lg:col-span-2 card p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Weekly Task Completion</h3>
          <div className="h-48 sm:h-56 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={25} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Done" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
            <button onClick={() => navigate('/tasks')} className="btn-primary text-xs sm:text-sm justify-center">
              <Users size={16} /> <span className="hidden sm:inline">Assign</span> Tasks
            </button>
            <button onClick={() => navigate('/approvals')} className="btn-secondary text-xs sm:text-sm justify-center">
              <CheckCircle size={16} /> <span className="hidden sm:inline">Approve</span> Requests
            </button>
            <button onClick={() => navigate('/inventory')} className="btn-secondary text-xs sm:text-sm justify-center">
              <Package size={16} /> <span className="hidden sm:inline">Manage</span> Inventory
            </button>
            <button onClick={() => navigate('/reports')} className="btn-secondary text-xs sm:text-sm justify-center">
              <TrendingUp size={16} /> <span className="hidden sm:inline">View</span> Reports
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mt-3 sm:mt-4 lg:mt-6">
        <div className="card p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Pending Requests</h3>
          <div className="space-y-2 sm:space-y-3">
            {fundRequests.filter(r => r.status === 'pending').slice(0, 3).map(req => (
              <div key={req.id} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-700">£{req.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 truncate">{req.reason}</p>
                </div>
                <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                  <button className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200">
                    <CheckCircle size={14} />
                  </button>
                  <button className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 sm:mb-4">Active Tasks</h3>
          <div className="space-y-2 sm:space-y-3">
            {tasks.filter(t => t.status === 'in-progress').slice(0, 4).map(task => (
              <div key={task.id} className="p-2.5 sm:p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">{task.title}</p>
                  <span className="text-xs text-slate-500 flex-shrink-0">{task.dueDate}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${task.progress}%` }} />
                  </div>
                  <span className="text-xs text-slate-600 w-8">{task.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
