import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useDb } from '@/context/DbContext';

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useDb();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-14 sm:h-16 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-3 sm:px-4 lg:px-6 gap-2 sm:gap-4 transition-all">
      {/* Left: Mobile Menu Toggle */}
      <div className="flex items-center lg:hidden">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-none"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Center: Search Bar (Centered across all logins & screens) */}
      <div className="flex-1 max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
        <div className="relative w-full">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, products, employees..."
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 sm:p-2.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(s => !s); setShowProfile(false); }}
            className="p-2 sm:p-2.5 rounded-lg hover:bg-slate-100 text-slate-500 relative transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setShowNotifications(false)} />
              <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-72 lg:w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 overflow-hidden z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Notifications</span>
                  <button onClick={() => setShowNotifications(false)} className="sm:hidden p-1 hover:bg-slate-100 rounded">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-64 sm:max-h-72 overflow-y-auto">
                  {notifications.slice(0, 4).map(n => (
                    <div
                      key={n.id}
                      onClick={() => { navigate('/notifications'); setShowNotifications(false); }}
                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer ${!n.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <p className="text-sm text-slate-800 truncate">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.timestamp}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { navigate('/notifications'); setShowNotifications(false); }}
                  className="w-full text-center py-2 mt-1 border-t border-slate-100 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  View All
                </button>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(s => !s); setShowNotifications(false); }}
            className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 pr-1 sm:pr-2 py-1 sm:py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm flex-shrink-0">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-800 truncate max-w-[120px]">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={16} className="text-slate-400 hidden sm:block" />
          </button>
          {showProfile && (
            <>
              <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setShowProfile(false)} />
              <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-14 sm:w-48 lg:w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <User size={16} /> My Profile
                </button>
                <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Settings size={16} /> Settings
                </button>
                <hr className="my-2 border-slate-100" />
                <button onClick={logout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
