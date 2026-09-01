import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,

  Building2,
  Users,
  Clock,
  ClipboardList,
  Package,
  TruckIcon,
  DollarSign,
  ShoppingCart,
  BarChart3,
  CheckSquare,
  Bell,
  Settings,
  X,
  LogOut,
  Target,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'supervisor', 'employee'] },

  { path: '/branches', label: 'Branches', icon: Building2, roles: ['admin'] },
  { path: '/employees', label: 'Employees', icon: Users, roles: ['admin', 'supervisor'] },
  { path: '/attendance', label: 'Attendance', icon: Clock, roles: ['admin', 'supervisor', 'employee'] },
  { path: '/tasks', label: 'Tasks', icon: ClipboardList, roles: ['admin', 'supervisor', 'employee'] },
  { path: '/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'supervisor'] },
  { path: '/vendors', label: 'Vendors', icon: TruckIcon, roles: ['admin'] },
  { path: '/finance', label: 'Finance', icon: DollarSign, roles: ['admin', 'supervisor'] },
  { path: '/orders', label: 'Orders', icon: ShoppingCart, roles: ['admin', 'supervisor'] },
  { path: '/leads', label: 'Leads', icon: Target, roles: ['admin', 'supervisor'] },
  { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'supervisor'] },
  { path: '/approvals', label: 'Approval Center', icon: CheckSquare, roles: ['admin', 'supervisor'] },
  { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'supervisor', 'employee'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(item => {
    return item.roles.includes(user?.role || '');
  });

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200
        w-64 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              GD
            </div>
            <span className="font-semibold text-slate-800 text-sm sm:text-base">GlobalDrop</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-2 sm:p-3 space-y-0.5 sm:space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-2 sm:p-3 border-t border-slate-200">
          <button
            onClick={logout}
            className="sidebar-item sidebar-item-inactive w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
