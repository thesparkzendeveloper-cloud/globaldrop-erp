import React, { useState } from 'react';
import { Building2, Users, Shield, Palette, Globe, Database, FileText, ChevronRight, Save, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const tabs = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'roles', label: 'Roles', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'backup', label: 'Backup', icon: Database },
  { id: 'audit', label: 'Audit', icon: FileText },
];

const roles = [
  { name: 'Admin', perms: ['All permissions'], users: 2 },
  { name: 'Supervisor', perms: ['Manage Branch', 'Approve Requests', 'View Reports', 'Assign Tasks'], users: 5 },
  { name: 'Employee', perms: ['Check In/Out', 'Update Tasks', 'Request Items'], users: 58 },
];

const auditLogs = [
  { action: 'User Login', user: 'John Smith', time: '2026-07-06 09:15', ip: '192.168.1.100' },
  { action: 'Order Created', user: 'Sarah Johnson', time: '2026-07-06 10:30', ip: '192.168.1.105' },
  { action: 'Inventory Updated', user: 'Lisa Anderson', time: '2026-07-06 11:45', ip: '192.168.1.108' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="page-enter">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Manage system settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="w-full lg:w-56 flex-shrink-0">
          <div className="flex gap-1 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 lg:flex-col lg:gap-1 lg:overflow-x-visible lg:pb-0">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium flex-shrink-0 lg:flex-shrink-0 lg:w-full ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
                <tab.icon size={16} />
                <span>{tab.label}</span>
                <ChevronRight size={14} className="ml-auto hidden lg:block opacity-50" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'company' && (
            <div className="card p-3 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">Company Profile</h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-lg sm:text-2xl font-bold">GD</div>
                  <div>
                    <button className="btn-secondary text-xs sm:text-sm">Upload Logo</button>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div><label className="form-label">Name</label><input type="text" defaultValue="GlobalDrop Logistics" className="form-input" /></div>
                  <div><label className="form-label">Industry</label><select className="form-input"><option>Logistics</option><option>E-commerce</option></select></div>
                  <div><label className="form-label">Email</label><input type="email" defaultValue="info@globaldrop.com" className="form-input" /></div>
                  <div><label className="form-label">Phone</label><input type="text" defaultValue="+1 (800) 555-0199" className="form-input" /></div>
                  <div className="sm:col-span-2"><label className="form-label">Address</label><textarea defaultValue="350 Fifth Avenue, New York" className="form-input" rows={2} /></div>
                </div>
                <button className="btn-primary w-full sm:w-auto"><Save size={16} /> Save</button>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="card p-3 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">Roles & Permissions</h2>
              <div className="space-y-3 sm:space-y-4">
                {roles.map(role => (
                  <div key={role.name} className="border rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div>
                        <p className="font-medium text-slate-800 text-sm sm:text-base">{role.name}</p>
                        <p className="text-xs text-slate-500">{role.users} users</p>
                      </div>
                      <button className="btn-secondary text-xs">Edit</button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.perms.map(p => <span key={p} className="badge-slate text-xs">{p}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-3 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">Security</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800 text-sm sm:text-base">2FA</p>
                    <p className="text-xs text-slate-500">Two-factor authentication</p>
                  </div>
                  <button className="btn-primary text-xs sm:text-sm">Enable</button>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800 text-sm sm:text-base">Password Expiry</p>
                    <p className="text-xs text-slate-500">Force change every 90 days</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer"><input type="checkbox" defaultChecked className="sr-only peer" /><div className="w-10 h-5 bg-slate-200 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" /></label>
                </div>
                <button className="btn-secondary text-xs sm:text-sm">Change Password</button>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="card p-3 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">Theme</h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 text-sm sm:text-base">Current Theme</p>
                    <p className="text-xs text-slate-500">Light or dark mode</p>
                  </div>
                  <div className="flex p-1 rounded-lg bg-slate-100">
                    <button onClick={() => theme !== 'light' && toggleTheme()} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs ${theme === 'light' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><Sun size={14} /> Light</button>
                    <button onClick={() => theme !== 'dark' && toggleTheme()} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs ${theme === 'dark' ? 'bg-slate-700 shadow text-white' : 'text-slate-500'}`}><Moon size={14} /> Dark</button>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-xs sm:text-sm mb-3">Accent Color</p>
                  <div className="flex gap-2">
                    {['bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-600', 'bg-rose-600'].map(c => <button key={c} className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${c}`} />)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="card p-3 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">Language</h2>
              <div className="space-y-3 sm:space-y-4">
                <div><label className="form-label">Language</label><select className="form-input"><option>English (US)</option><option>Deutsch</option><option>日本語</option></select></div>
                <div><label className="form-label">Timezone</label><select className="form-input"><option>America/New_York</option><option>Europe/London</option><option>Asia/Tokyo</option></select></div>
                <div><label className="form-label">Date Format</label><select className="form-input"><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></select></div>
              </div>
              <button className="btn-primary mt-4 sm:mt-6"><Save size={16} /> Save</button>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="card p-3 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">Backup</h2>
              <div className="p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-emerald-700 font-medium">Last Backup: July 5, 2026</p>
                <p className="text-xs text-emerald-600">Daily backups enabled</p>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg mb-3 sm:mb-4">
                <div>
                  <p className="font-medium text-slate-800 text-sm">Auto Backup</p>
                  <p className="text-xs text-slate-500">Daily at midnight</p>
                </div>
                <label className="relative inline-flex cursor-pointer"><input type="checkbox" defaultChecked className="sr-only peer" /><div className="w-10 h-5 bg-slate-200 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" /></label>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button className="btn-secondary text-xs sm:text-sm">Create Backup</button>
                <button className="btn-secondary text-xs sm:text-sm">Restore</button>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="card p-3 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">Audit Logs</h2>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full min-w-[400px]">
                  <thead className="bg-slate-50 border-b"><tr>
                    <th className="table-header">Action</th>
                    <th className="table-header">User</th>
                    <th className="table-header hidden sm:table-cell">Time</th>
                    <th className="table-header hidden md:table-cell">IP</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {auditLogs.map((log, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="table-cell font-medium">{log.action}</td>
                        <td className="table-cell text-slate-600">{log.user}</td>
                        <td className="table-cell hidden sm:table-cell text-slate-500 text-xs">{log.time}</td>
                        <td className="table-cell hidden md:table-cell text-slate-500 text-xs">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn-secondary mt-4 text-xs sm:text-sm w-full sm:w-auto">Load More</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
