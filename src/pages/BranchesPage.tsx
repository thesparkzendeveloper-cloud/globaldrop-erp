import React, { useState } from 'react';
import { Plus, Pencil, Power, Search, X, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import type { Branch } from '@/types';

export default function BranchesPage() {
  const { branches, countries, employees, addBranch, updateBranch, deleteBranch } = useDb();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [viewBranch, setViewBranch] = useState<Branch | null>(null);

  const filteredBranches = branches.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                        b.country.toLowerCase().includes(search.toLowerCase()) || 
                        b.address.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const openEditModal = (branch?: Branch) => {
    setEditBranch(branch || null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
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
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    try {
      const newStatus = branch.status === 'active' ? 'inactive' : 'active';
      await updateBranch(branch.id, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Branches</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Manage branches and office locations</p>
        </div>
        <button onClick={() => openEditModal()} className="btn-primary w-full sm:w-auto">
          <Plus size={16} /> <span>Add Branch</span>
        </button>
      </div>

      <div className="card p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search branches..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-8 sm:pl-10 pr-16"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hidden sm:block">
            {filteredBranches.length} branches
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {filteredBranches.map(branch => (
          <div key={branch.id} className="card p-3 sm:p-4 lg:p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Building2 size={16} className="text-white sm:hidden" />
                  <Building2 size={20} className="text-white hidden sm:block" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">{branch.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500">{branch.country}</p>
                </div>
              </div>
              <span className={branch.status === 'active' ? 'badge-green' : 'badge-red'}>
                {branch.status}
              </span>
            </div>

            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{branch.address}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <Phone size={12} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{branch.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <Mail size={12} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{branch.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 truncate">Manager: {branch.manager || 'N/A'}</p>
              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                <button onClick={() => setViewBranch(branch)} className="p-1.5 sm:p-2 hover:bg-blue-50 rounded-lg text-blue-600">
                  <Search size={14} />
                </button>
                <button onClick={() => openEditModal(branch)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleToggleStatus(branch)} className={`p-1.5 sm:p-2 rounded-lg ${branch.status === 'active' ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-500'}`}>
                  <Power size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="modal-content p-4 sm:p-6 max-h-[85vh] sm:max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editBranch ? 'Edit Branch' : 'Add Branch'}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
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
                <select name="country" className="form-input" defaultValue={editBranch?.country || countries[0]?.name}>
                  {countries.filter(c => c.status === 'active').map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
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
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center">
                {editBranch ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {viewBranch && (
        <div className="modal-overlay" onClick={() => setViewBranch(null)}>
          <div className="modal-content p-4 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">{viewBranch.name}</h2>
              <button onClick={() => setViewBranch(null)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Country</span><span className="font-medium truncate ml-2">{viewBranch.country}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Address</span><span className="font-medium truncate ml-2">{viewBranch.address}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-medium">{viewBranch.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-medium truncate ml-2">{viewBranch.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Manager</span><span className="font-medium">{viewBranch.manager || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Status</span><span className={viewBranch.status === 'active' ? 'badge-green' : 'badge-red'}>{viewBranch.status}</span></div>
              </div>
            </div>
            <button onClick={() => setViewBranch(null)} className="btn-primary w-full justify-center mt-4 sm:mt-6">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

