import React from 'react';
import { Building2, Save } from 'lucide-react';
import { useDb } from '@/context/DbContext';

export default function SettingsPage() {
  const { settings, updateSettings } = useDb();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updateSettings({
      companyName: fd.get('companyName'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      address: fd.get('address'),
      industry: fd.get('industry'),
    });
    alert('Company settings saved!');
  };

  return (
    <div className="page-enter">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Manage company profile</p>
      </div>

      <div className="card p-4 sm:p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 size={20} className="text-blue-600" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">Company Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Logo placeholder */}
          <div className="flex items-center gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-slate-100">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-lg sm:text-2xl font-bold flex-shrink-0">
              GD
            </div>
            <div>
              <button type="button" className="btn-secondary text-xs sm:text-sm">Upload Logo</button>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="form-label">Company Name</label>
              <input
                type="text"
                name="companyName"
                className="form-input"
                defaultValue={settings?.companyName || 'GlobalDrop Logistics'}
                required
              />
            </div>
            <div>
              <label className="form-label">Industry</label>
              <select name="industry" className="form-input" defaultValue={settings?.industry || 'Logistics'}>
                <option>Logistics</option>
                <option>E-commerce</option>
                <option>Manufacturing</option>
                <option>Retail</option>
                <option>Technology</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                defaultValue={settings?.email || 'info@globaldrop.com'}
                required
              />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                defaultValue={settings?.phone || '+1 (800) 555-0199'}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Address</label>
              <textarea
                name="address"
                className="form-input"
                rows={2}
                defaultValue={settings?.address || '350 Fifth Avenue, New York'}
              />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="btn-primary w-full sm:w-auto">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
