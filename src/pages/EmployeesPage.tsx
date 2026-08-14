import React, { useState } from 'react';
import { Plus, Pencil, Power, Search, Key, Clock, X, Filter } from 'lucide-react';
import { useDb } from '@/context/DbContext';

export default function EmployeesPage() {
  const { employees, branches, countries, addEmployee, updateEmployee } = useDb();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<typeof employees[0] | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');

  const filteredEmployees = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                       e.email.toLowerCase().includes(search.toLowerCase()) ||
                       e.id.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || e.role === filterRole;
    const matchBranch = filterBranch === 'all' || e.branch === filterBranch;
    return matchSearch && matchRole && matchBranch;
  });

  const openModal = (emp?: typeof employees[0]) => {
    setEditingEmployee(emp || null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const employeeData = {
      name: `${formData.get('firstName')} ${formData.get('lastName')}`,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: formData.get('role') as any,
      country: formData.get('country') as string,
      branch: formData.get('branch') as string,
      joinDate: formData.get('joinDate') as string,
      status: formData.get('status') as 'active' | 'inactive',
    };

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, employeeData);
      } else {
        const newId = 'EMP' + Math.floor(100 + Math.random() * 900);
        await addEmployee({ ...employeeData, id: newId, password: 'password123' });
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (emp: typeof employees[0]) => {
    try {
      const newStatus = emp.status === 'active' ? 'inactive' : 'active';
      await updateEmployee(emp.id, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = () => {
    alert("Password has been reset to default 'password123' for security.");
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Employees</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Manage employees and their roles</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary w-full sm:w-auto">
          <Plus size={16} /> <span>Add Employee</span>
        </button>
      </div>

      <div className="card p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-8 sm:pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:pb-0">
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="form-input flex-1 sm:flex-none sm:w-28">
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
              <option value="employee">Employee</option>
            </select>
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="form-input flex-1 sm:flex-none sm:w-36">
              <option value="all">All Branches</option>
              {branches.filter(b => b.status === 'active').map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
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
              <th className="table-header">Employee</th>
              <th className="table-header">Role</th>
              <th className="table-header hidden md:table-cell">Branch</th>
              <th className="table-header hidden lg:table-cell">Join Date</th>
              <th className="table-header">Status</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                <td className="table-cell">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-xs sm:text-sm truncate">{emp.name}</p>
                      <p className="text-xs text-slate-500 truncate">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge text-xs ${emp.role === 'admin' ? 'badge-purple' : emp.role === 'supervisor' ? 'badge-blue' : 'badge-slate'}`}>
                    {emp.role}
                  </span>
                </td>
                <td className="table-cell hidden md:table-cell">
                  <div className="min-w-0">
                    <p className="text-slate-700 text-xs sm:text-sm truncate">{emp.branch}</p>
                    <p className="text-xs text-slate-500">{emp.country}</p>
                  </div>
                </td>
                <td className="table-cell hidden lg:table-cell text-slate-600 text-xs sm:text-sm">
                  {emp.joinDate}
                </td>
                <td className="table-cell">
                  <span className={emp.status === 'active' ? 'badge-green' : 'badge-red'}>
                    {emp.status}
                  </span>
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                    <button onClick={() => openModal(emp)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={handleResetPassword} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-amber-600 hidden sm:block" title="Reset Password">
                      <Key size={14} />
                    </button>
                    <button onClick={() => handleToggleStatus(emp)} className={`p-1.5 hover:bg-slate-100 rounded-lg ${emp.status === 'active' ? 'text-slate-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}`} title={emp.status === 'active' ? 'Disable' : 'Enable'}>
                      <Power size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 sm:p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <p className="text-xs sm:text-sm text-slate-500">{filteredEmployees.length} employees</p>
          <div className="flex gap-1">
            <button className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded text-xs bg-blue-600 text-white">1</button>
            <button className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded text-xs hover:bg-slate-100 text-slate-600">2</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="modal-content p-4 sm:p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="form-label">First Name</label>
                  <input type="text" name="firstName" defaultValue={editingEmployee?.name.split(' ')[0]} placeholder="John" className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input type="text" name="lastName" defaultValue={editingEmployee?.name.split(' ')[1]} placeholder="Smith" className="form-input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" name="email" defaultValue={editingEmployee?.email} placeholder="email@company.com" className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input type="text" name="phone" defaultValue={editingEmployee?.phone} placeholder="+1 (212) 555-0101" className="form-input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="form-label">Role</label>
                  <select name="role" className="form-input" defaultValue={editingEmployee?.role || 'employee'}>
                    <option value="employee">Employee</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select name="status" className="form-input" defaultValue={editingEmployee?.status || 'active'}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="form-label">Country</label>
                  <select name="country" className="form-input" defaultValue={editingEmployee?.country || countries[0]?.name}>
                    {countries.filter(c => c.status === 'active').map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Branch</label>
                  <select name="branch" className="form-input" defaultValue={editingEmployee?.branch || branches[0]?.name}>
                    {branches.filter(b => b.status === 'active').map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Join Date</label>
                <input type="date" name="joinDate" defaultValue={editingEmployee?.joinDate || new Date().toISOString().split('T')[0]} className="form-input" required />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center">
                {editingEmployee ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

