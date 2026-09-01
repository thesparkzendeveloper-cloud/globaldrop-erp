import React, { useState, useMemo } from 'react';
import {
  Target, Plus, Search, Filter, Edit2, Trash2, X,
  TrendingUp, Users, CheckCircle, PhoneCall, Mail,
  Globe, Share2, UserCheck, ChevronDown, DollarSign
} from 'lucide-react';
import { useDb } from '@/context/DbContext';
import { useAuth } from '@/context/AuthContext';
import type { Lead } from '@/types';

const STATUS_CONFIG = {
  new:       { label: 'New',       color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  qualified: { label: 'Qualified', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  lost:      { label: 'Lost',      color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
};

const SOURCE_CONFIG = {
  website:   { label: 'Website',   icon: Globe },
  social:    { label: 'Social',    icon: Share2 },
  referral:  { label: 'Referral',  icon: UserCheck },
  'cold-call': { label: 'Cold Call', icon: PhoneCall },
  email:     { label: 'Email',     icon: Mail },
  other:     { label: 'Other',     icon: Target },
};

const EMPTY_FORM: Omit<Lead, 'id'> = {
  name: '',
  email: '',
  phone: '',
  company: '',
  source: 'website',
  status: 'new',
  assignedTo: '',
  assignedToName: '',
  value: 0,
  notes: '',
};

export default function LeadsPage() {
  const { leads, employees, addLead, updateLead, deleteLead } = useDb();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<Omit<Lead, 'id'>>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    total:     leads.length,
    new:       leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost:      leads.filter(l => l.status === 'lost').length,
    totalValue: leads.filter(l => l.status === 'converted').reduce((s, l) => s + (l.value || 0), 0),
  }), [leads]);

  // Filtered leads
  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        (l.company || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchSource = sourceFilter === 'all' || l.source === sourceFilter;
      return matchSearch && matchStatus && matchSource;
    });
  }, [leads, search, statusFilter, sourceFilter]);

  // Available employees for assignment
  const assignableEmployees = employees.filter(e => e.status === 'active');

  const openAdd = () => {
    setEditingLead(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company || '',
      source: lead.source,
      status: lead.status,
      assignedTo: lead.assignedTo,
      assignedToName: lead.assignedToName,
      value: lead.value,
      notes: lead.notes || '',
    });
    setShowModal(true);
  };

  const handleAssign = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const emp = assignableEmployees.find(em => em.id === e.target.value);
    setForm(prev => ({
      ...prev,
      assignedTo: emp?.id || '',
      assignedToName: emp?.name || '',
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone || !form.assignedTo) return;
    setSaving(true);
    try {
      if (editingLead) {
        await updateLead(editingLead.id, form);
      } else {
        await addLead(form);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteLead(id);
    setDeleteConfirm(null);
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="text-blue-600" size={24} />
            Lead Generation
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage your sales leads pipeline</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Lead
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Leads', value: stats.total, icon: Users, color: 'from-blue-500 to-blue-600' },
          { label: 'New', value: stats.new, icon: Target, color: 'from-sky-500 to-sky-600' },
          { label: 'Qualified', value: stats.qualified, icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
          { label: 'Converted', value: stats.converted, icon: CheckCircle, color: 'from-green-500 to-green-600' },
          { label: 'Lost', value: stats.lost, icon: X, color: 'from-red-500 to-red-600' },
          { label: 'Revenue', value: formatCurrency(stats.totalValue), icon: DollarSign, color: 'from-emerald-500 to-emerald-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
              <Icon size={16} className="text-white" />
            </div>
            <p className="text-xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          {/* Status Filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          {/* Source Filter */}
          <div className="relative">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 appearance-none bg-white"
            >
              <option value="all">All Sources</option>
              {Object.entries(SOURCE_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Lead', 'Company', 'Source', 'Status', 'Assigned To', 'Value', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Target size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="font-medium">No leads found</p>
                    <p className="text-xs mt-1">Add your first lead to get started</p>
                  </td>
                </tr>
              ) : (
                filtered.map(lead => {
                  const status = STATUS_CONFIG[lead.status];
                  const SourceIcon = SOURCE_CONFIG[lead.source]?.icon || Target;
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800">{lead.name}</p>
                          <p className="text-xs text-slate-400">{lead.email}</p>
                          <p className="text-xs text-slate-400">{lead.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lead.company || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-slate-600">
                          <SourceIcon size={13} className="text-slate-400" />
                          {SOURCE_CONFIG[lead.source]?.label || lead.source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lead.assignedToName}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {lead.value > 0 ? formatCurrency(lead.value) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(lead)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(lead.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            Showing {filtered.length} of {leads.length} leads
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  placeholder="John Smith"
                />
              </div>
              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    placeholder="+1 555 000 0000"
                  />
                </div>
              </div>
              {/* Company */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  placeholder="Acme Corp"
                />
              </div>
              {/* Source + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Source</label>
                  <select
                    value={form.source}
                    onChange={e => setForm(p => ({ ...p, source: e.target.value as Lead['source'] }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  >
                    {Object.entries(SOURCE_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as Lead['status'] }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Assigned To + Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Assign To *</label>
                  <select
                    value={form.assignedTo}
                    onChange={handleAssign}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  >
                    <option value="">Select employee</option>
                    {assignableEmployees.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Deal Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.value}
                    onChange={e => setForm(p => ({ ...p, value: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    placeholder="0"
                  />
                </div>
              </div>
              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
                  placeholder="Add any relevant notes..."
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.email || !form.phone || !form.assignedTo}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? 'Saving...' : editingLead ? 'Save Changes' : 'Add Lead'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Delete Lead?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
