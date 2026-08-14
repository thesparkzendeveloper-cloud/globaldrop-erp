import React, { useState } from 'react';
import { Plus, Pencil, Power, Search, Filter, X } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import type { Country } from '@/types';

export default function CountriesPage() {
  const { countries, addCountry, updateCountry, deleteCountry } = useDb();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCountry, setEditCountry] = useState<Country | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredCountries = countries.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const openModal = (country?: Country) => {
    setEditCountry(country || null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const countryData = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      currency: formData.get('currency') as string,
      timezone: formData.get('timezone') as string,
      status: formData.get('status') as 'active' | 'inactive'
    };

    try {
      if (editCountry) {
        await updateCountry(editCountry.id, countryData);
      } else {
        await addCountry(countryData);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (country: Country) => {
    try {
      const newStatus = country.status === 'active' ? 'inactive' : 'active';
      await updateCountry(country.id, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Countries</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Manage countries and regional settings</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary w-full sm:w-auto">
          <Plus size={16} /> <span>Add Country</span>
        </button>
      </div>

      <div className="card p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-8 sm:pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="form-input flex-1 sm:flex-none sm:w-32"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="btn-secondary hidden sm:flex">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="table-header">Country</th>
              <th className="table-header">Code</th>
              <th className="table-header hidden md:table-cell">Currency</th>
              <th className="table-header hidden lg:table-cell">Timezone</th>
              <th className="table-header">Status</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCountries.map(country => (
              <tr key={country.id} className="hover:bg-slate-50 transition-colors">
                <td className="table-cell">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {country.code}
                    </div>
                    <span className="font-medium text-xs sm:text-sm">{country.name}</span>
                  </div>
                </td>
                <td className="table-cell text-slate-600">{country.code}</td>
                <td className="table-cell hidden md:table-cell text-slate-600">{country.currency}</td>
                <td className="table-cell hidden lg:table-cell text-slate-600 text-xs">{country.timezone}</td>
                <td className="table-cell">
                  <span className={country.status === 'active' ? 'badge-green' : 'badge-red'}>
                    {country.status}
                  </span>
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-1 sm:gap-2">
                    <button onClick={() => openModal(country)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleToggleStatus(country)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600" title={country.status === 'active' ? 'Deactivate' : 'Activate'}>
                      <Power size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="modal-content p-4 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editCountry ? 'Edit Country' : 'Add Country'}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="form-label">Country Name</label>
                <input type="text" name="name" defaultValue={editCountry?.name} placeholder="United States" className="form-input" required />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="form-label">Country Code</label>
                  <input type="text" name="code" defaultValue={editCountry?.code} placeholder="US" className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Currency</label>
                  <input type="text" name="currency" defaultValue={editCountry?.currency} placeholder="USD" className="form-input" required />
                </div>
              </div>
              <div>
                <label className="form-label">Timezone</label>
                <select name="timezone" className="form-input" defaultValue={editCountry?.timezone || 'America/New_York'}>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                  <option>Europe/Paris</option>
                  <option>Asia/Tokyo</option>
                  <option>Australia/Sydney</option>
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select name="status" className="form-input" defaultValue={editCountry?.status || 'active'}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center">
                {editCountry ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

