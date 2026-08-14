import React, { useState } from 'react';
import { Bell, CheckCircle, Package, DollarSign, AlertTriangle, ShoppingCart, Check, X } from 'lucide-react';
import { useDb } from '@/context/DbContext';

const typeIcons: Record<string, any> = { task: CheckCircle, inventory: Package, fund: DollarSign, alert: AlertTriangle, order: ShoppingCart };
const typeColors: Record<string, string> = { task: 'bg-blue-100 text-blue-600', inventory: 'bg-emerald-100 text-emerald-600', fund: 'bg-violet-100 text-violet-600', alert: 'bg-red-100 text-red-600', order: 'bg-amber-100 text-amber-600' };
const priorityColors: Record<string, string> = { low: 'badge-slate', medium: 'badge-yellow', high: 'badge-red', critical: 'badge-purple' };

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useDb();
  const [filter, setFilter] = useState<string>('all');

  const filtered = notifications.filter(n => filter === 'all' || (filter === 'unread' && !n.read) || n.type === filter);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const markAll = async () => {
    const unread = notifications.filter(n => !n.read);
    try {
      await Promise.all(unread.map(n => markNotificationRead(n.id)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Notifications</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAll} className="btn-secondary w-full sm:w-auto text-xs sm:text-sm">
            <Check size={14} /> Mark All Read
          </button>
        )}
      </div>

      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
        {['all', 'unread', 'task', 'inventory', 'alert'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex-shrink-0 capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2 sm:space-y-3">
        {filtered.map(n => {
          const Icon = typeIcons[n.type];
          return (
            <div key={n.id} className={`card p-3 sm:p-4 flex items-start gap-2 sm:gap-4 cursor-pointer hover:shadow-md transition-all ${!n.read ? 'border-l-4 border-l-blue-500' : ''}`} onClick={() => markAsRead(n.id)}>
              <div className={`p-2 sm:p-2.5 rounded-lg ${typeColors[n.type]} flex-shrink-0`}><Icon size={16} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-slate-800 text-xs sm:text-sm truncate">{n.title}</p>
                    <span className={`${priorityColors[n.priority]} text-xs`}>{n.priority}</span>
                  </div>
                  <p className="text-xs text-slate-400 whitespace-nowrap">{n.timestamp}</p>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 sm:mt-1 line-clamp-2">{n.message}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card p-8 sm:p-12 text-center">
            <Bell size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
