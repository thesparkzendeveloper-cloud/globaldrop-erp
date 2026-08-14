import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Power, Search, Filter, X, Building2, Phone, Mail, MapPin, Globe2 } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import { TIMEZONES } from '@/data/timezones';
import type { Country, Branch } from '@/types';

export default function LocationsPage() {
  const {
    countries,
    branches,
    employees,
    addCountry,
    updateCountry,
    addBranch,
    updateBranch
  } = useDb();

  // Country State
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [editCountry, setEditCountry] = useState<Country | null>(null);
  const [filterCountryStatus, setFilterCountryStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Branch State
  const [branchSearch, setBranchSearch] = useState('');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [viewBranch, setViewBranch] = useState<Branch | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string>('');

  // Sync selected country
  const activeCountries = countries.filter(c => c.status === 'active');
  
  useEffect(() => {
    if (countries.length > 0 && !selectedCountryName) {
      const firstActive = countries.find(c => c.status === 'active');
      setSelectedCountryName(firstActive ? firstActive.name : countries[0].name);
    }
  }, [countries, selectedCountryName]);

  // Countries Filtering
  const filteredCountries = countries.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
                        c.code.toLowerCase().includes(countrySearch.toLowerCase());
    const matchFilter = filterCountryStatus === 'all' || c.status === filterCountryStatus;
    return matchSearch && matchFilter;
  });

  // Branches Filtering
  const filteredBranches = branches.filter(b => {
    const matchCountry = b.country === selectedCountryName;
    const matchSearch = b.name.toLowerCase().includes(branchSearch.toLowerCase()) || 
                        b.address.toLowerCase().includes(branchSearch.toLowerCase());
    return matchCountry && matchSearch;
  });

  // Handlers for Country
  const openCountryModal = (country?: Country) => {
    setEditCountry(country || null);
    setShowCountryModal(true);
  };

  const handleCountrySave = async (e: React.FormEvent<HTMLFormElement>) => {
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
      setShowCountryModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCountryStatus = async (country: Country) => {
    try {
      const newStatus = country.status === 'active' ? 'inactive' : 'active';
      await updateCountry(country.id, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers for Branch
  const openBranchModal = (branch?: Branch) => {
    setEditBranch(branch || null);
    setShowBranchModal(true);
  };

  const handleBranchSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const branchData = {
      name: formData.get('name') as string,
      country: formData.get('country') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      manager: formData.get('manager') as string,
      status: formData.get('status') as 'active' | 'inactive'
    };

    try {
      if (editBranch) {
        await updateBranch(editBranch.id, branchData);
      } else {
        await addBranch(branchData);
      }
      setShowBranchModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBranchStatus = async (branch: Branch) => {
    try {
      const newStatus = branch.status === 'active' ? 'inactive' : 'active';
      await updateBranch(branch.id, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Countries & Branches</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Manage countries, regional configurations, and branch office locations</p>
        </div>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMN 1: Countries card */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="card flex-1 flex flex-col min-h-[500px]">
            {/* Card Header */}
            <div className="p-4 border-b border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe2 className="text-blue-600" size={20} />
                  <h2 className="font-semibold text-slate-800 text-base">Countries</h2>
                </div>
                <button 
                  onClick={() => openCountryModal()} 
                  className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1"
                >
                  <Plus size={14} /> Add Country
                </button>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={e => setCountrySearch(e.target.value)}
                    className="form-input pl-8 py-1.5 text-xs"
                  />
                </div>
                <select
                  value={filterCountryStatus}
                  onChange={e => setFilterCountryStatus(e.target.value as any)}
                  className="form-input py-1.5 px-2 text-xs w-28"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Countries List */}
            <div className="flex-1 overflow-y-auto max-h-[550px] divide-y divide-slate-100">
              {filteredCountries.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No countries found.
                </div>
              ) : (
                filteredCountries.map(country => {
                  const isSelected = country.name === selectedCountryName;
                  return (
                    <div
                      key={country.id}
                      onClick={() => setSelectedCountryName(country.name)}
                      className={`flex items-center justify-between p-3.5 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-50/60 border-l-4 border-blue-600 pl-2.5 font-medium' 
                          : 'hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                          isSelected ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-slate-500 to-slate-600'
                        }`}>
                          {country.code}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-slate-800 truncate">{country.name}</div>
                          <div className="text-xs text-slate-400 truncate">{country.currency} • {country.timezone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <span className={country.status === 'active' ? 'badge-green text-[10px] py-0.5 px-1.5' : 'badge-red text-[10px] py-0.5 px-1.5'}>
                          {country.status}
                        </span>
                        <button 
                          onClick={() => openCountryModal(country)} 
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button 
                          onClick={() => handleToggleCountryStatus(country)} 
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600 transition-colors"
                          title={country.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: Branches card */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="card flex-1 flex flex-col min-h-[500px]">
            {/* Card Header */}
            <div className="p-4 border-b border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Building2 className="text-blue-600" size={20} />
                  <h2 className="font-semibold text-slate-800 text-base">
                    Branches {selectedCountryName ? `in ${selectedCountryName}` : ''}
                  </h2>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <select 
                    value={selectedCountryName} 
                    onChange={e => setSelectedCountryName(e.target.value)} 
                    className="form-input py-1.5 px-2 text-xs w-full sm:w-44"
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => (
                      <option key={c.id} value={c.name}>{c.name} {c.status === 'inactive' ? '(Inactive)' : ''}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => openBranchModal()} 
                    className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 flex-shrink-0"
                    disabled={!selectedCountryName}
                  >
                    <Plus size={14} /> Add Branch
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search branches in this country..."
                  value={branchSearch}
                  onChange={e => setBranchSearch(e.target.value)}
                  className="form-input pl-8 py-1.5 text-xs w-full"
                  disabled={!selectedCountryName}
                />
              </div>
            </div>

            {/* Branches List */}
            <div className="flex-1 p-4 overflow-y-auto max-h-[550px]">
              {!selectedCountryName ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 text-sm">
                  <Building2 className="text-slate-300 mb-2" size={32} />
                  <p>Please select a country on the left or via the dropdown to manage its branches.</p>
                </div>
              ) : filteredBranches.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  No branches found for {selectedCountryName}.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredBranches.map(branch => (
                    <div key={branch.id} className="bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0">
                              <Building2 size={15} className="text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800 text-sm truncate">{branch.name}</h3>
                          </div>
                          <span className={branch.status === 'active' ? 'badge-green text-[10px] py-0.5 px-1.5 flex-shrink-0' : 'badge-red text-[10px] py-0.5 px-1.5 flex-shrink-0'}>
                            {branch.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-slate-500">
                          <div className="flex items-start gap-1.5">
                            <MapPin size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{branch.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-slate-400 flex-shrink-0" />
                            <span>{branch.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate">{branch.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-50 text-xs">
                        <span className="text-slate-400 truncate max-w-[120px]">
                          Mgr: <strong className="text-slate-600 font-medium">{branch.manager || 'N/A'}</strong>
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button 
                            onClick={() => setViewBranch(branch)} 
                            className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors" 
                            title="View Details"
                          >
                            <Search size={13} />
                          </button>
                          <button 
                            onClick={() => openBranchModal(branch)} 
                            className="p-1.5 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-600 transition-colors" 
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button 
                            onClick={() => handleToggleBranchStatus(branch)} 
                            className={`p-1.5 rounded transition-colors ${branch.status === 'active' ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-500'}`} 
                            title={branch.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            <Power size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Country Modal */}
      {showCountryModal && (
        <div className="modal-overlay z-[100]" onClick={() => setShowCountryModal(false)}>
          <form onSubmit={handleCountrySave} className="modal-content p-4 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editCountry ? 'Edit Country' : 'Add Country'}
              </h2>
              <button type="button" onClick={() => setShowCountryModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
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
                <select name="timezone" className="form-input" defaultValue={editCountry?.timezone || 'GMT+00:00'}>
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                  {editCountry?.timezone && !TIMEZONES.includes(editCountry.timezone) && (
                    <option key={editCountry.timezone} value={editCountry.timezone}>{editCountry.timezone}</option>
                  )}
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
              <button type="button" onClick={() => setShowCountryModal(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center">
                {editCountry ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Branch Modal */}
      {showBranchModal && (
        <div className="modal-overlay z-[100]" onClick={() => setShowBranchModal(false)}>
          <form onSubmit={handleBranchSave} className="modal-content p-4 sm:p-6 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editBranch ? 'Edit Branch' : 'Add Branch'}
              </h2>
              <button type="button" onClick={() => setShowBranchModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="form-label">Branch Name</label>
                <input type="text" name="name" defaultValue={editBranch?.name} placeholder="New York HQ" className="form-input" required />
              </div>
              <div>
                <label className="form-label">Country</label>
                <select name="country" className="form-input bg-slate-50 border-slate-200" value={editBranch?.country || selectedCountryName} disabled>
                  {countries.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <input type="hidden" name="country" value={editBranch?.country || selectedCountryName} />
              </div>

              <div>
                <label className="form-label">Address</label>
                <textarea name="address" defaultValue={editBranch?.address} placeholder="Full address" className="form-input" rows={2} required />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="form-label">Phone</label>
                  <input type="text" name="phone" defaultValue={editBranch?.phone} placeholder="+1 (212) 555-0100" className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" name="email" defaultValue={editBranch?.email} placeholder="nyhq@company.com" className="form-input" required />
                </div>
              </div>
              <div>
                <label className="form-label">Manager</label>
                <select name="manager" className="form-input" defaultValue={editBranch?.manager || ''}>
                  <option value="">Select manager</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select name="status" className="form-input" defaultValue={editBranch?.status || 'active'}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setShowBranchModal(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center">
                {editBranch ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Branch Detail Modal */}
      {viewBranch && (
        <div className="modal-overlay z-[100]" onClick={() => setViewBranch(null)}>
          <div className="modal-content p-4 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">{viewBranch.name}</h2>
              <button onClick={() => setViewBranch(null)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Country</span><span className="font-medium text-slate-800 ml-2">{viewBranch.country}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Address</span><span className="font-medium text-slate-800 ml-2 text-right">{viewBranch.address}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Phone</span><span className="font-medium text-slate-800">{viewBranch.phone}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Email</span><span className="font-medium text-slate-800 ml-2">{viewBranch.email}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Manager</span><span className="font-medium text-slate-800">{viewBranch.manager || 'N/A'}</span></div>
                <div className="flex justify-between pt-1"><span className="text-slate-500">Status</span><span className={viewBranch.status === 'active' ? 'badge-green' : 'badge-red'}>{viewBranch.status}</span></div>
              </div>
            </div>
            <button onClick={() => setViewBranch(null)} className="btn-primary w-full justify-center mt-4 sm:mt-6">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
