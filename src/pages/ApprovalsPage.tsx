import React, { useState } from 'react';
import { CheckCircle, XCircle, DollarSign, Package, ChevronDown, Send, X } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

export default function ApprovalsPage() {
  const { fundRequests, inventoryRequests, updateFundRequest, updateInventoryRequest, addFundRequest, branches } = useDb();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('funds');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);

  const tabs = [
    { id: 'funds', label: 'Funds', icon: DollarSign, count: fundRequests.filter(r => r.status === 'pending').length },
    { id: 'inventory', label: 'Inventory', icon: Package, count: inventoryRequests.filter(r => r.status === 'pending').length },
  ];

  const handleAction = async (req: any, type: 'fund' | 'inventory', status: 'approved' | 'rejected') => {
    try {
      if (type === 'fund') {
        await updateFundRequest(req.id, { status, remarks });
      } else if (type === 'inventory') {
        await updateInventoryRequest(req.id, { status, remarks });
      }
      setRemarks('');
      setExpanded(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const amount = parseFloat(formData.get('amount') as string) || 0;
    const reason = formData.get('reason') as string;
    const branch = formData.get('branch') as string;

    await addFundRequest({
      amount,
      reason,
      branch,
      requestedBy: user?.name || 'Supervisor',
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    });

    setShowRequestModal(false);
  };

  const renderCard = (req: any, type: 'fund' | 'inventory') => {
    const rawAmt = Number(req.amount ?? req.requestedAmount ?? req.fundAmount ?? req.totalAmount ?? req.value ?? req.price ?? req.cost ?? 0);
    const reasonText = req.reason || req.description || req.notes || req.purpose || req.title || req.details || 'No reason provided';
    const requestedUser = req.requestedBy || req.requestedByName || req.createdByName || req.employeeName || req.user || req.name || req.email || 'User';
    const reqDate = req.requestDate || req.date || req.createdDate || (req.createdAt ? String(req.createdAt).split('T')[0] : 'Today');
    const branchName = req.branch || req.fromBranch || req.toBranch || '';
    const isFund = type === 'fund';

    return (
      <div key={req.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow transition-all">
        <div className="flex items-center justify-between p-3.5 sm:p-4 cursor-pointer hover:bg-slate-50/80 transition-colors" onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className={`p-2.5 sm:p-3 rounded-xl ${isFund ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'} flex-shrink-0 mt-0.5`}>
              {isFund ? <DollarSign size={20} /> : <Package size={20} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-slate-800 text-sm sm:text-base">
                  {isFund ? `Amount: ${formatCurrency(rawAmt, user?.role)}` : `${req.quantity || 0} units (${req.product || 'Item'})`}
                </p>
                {branchName && (
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    📍 {branchName}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                Reason: <span className="text-slate-800 font-semibold">{reasonText}</span>
              </p>
              <div className="text-[11px] text-slate-500 mt-1.5 flex flex-wrap items-center gap-3">
                <span>Requested by: <strong className="text-slate-700 font-semibold">{requestedUser}</strong></span>
                <span>•</span>
                <span>Date: <strong className="text-slate-700 font-semibold">{reqDate}</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className={`badge uppercase text-[11px] tracking-wide font-bold ${req.status === 'pending' ? 'badge-yellow' : req.status === 'approved' ? 'badge-green' : 'badge-red'}`}>
              {req.status}
            </span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expanded === req.id ? 'rotate-180' : ''}`} />
          </div>
        </div>
        {expanded === req.id && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-200/80">
            {req.status === 'pending' ? (
              user?.role === 'admin' ? (
                <div className="space-y-3">
                  <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add admin remarks or instructions..." className="form-input text-xs sm:text-sm bg-white" rows={2} />
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(req, type, 'approved')} className="btn-primary flex-1 text-xs sm:text-sm justify-center py-2"><CheckCircle size={15} /> Approve Request</button>
                    <button onClick={() => handleAction(req, type, 'rejected')} className="btn-danger flex-1 text-xs sm:text-sm justify-center py-2"><XCircle size={15} /> Reject Request</button>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
                  <span>⏳</span> Request submitted to Admin. Awaiting approval decision.
                </p>
              )
            ) : (
              <div className="text-xs sm:text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200/60">
                <span className="font-semibold text-slate-700">Remarks: </span>
                <span>{req.remarks || req.notes || req.comment || 'No remarks provided'}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Approval Center</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Review and manage pending requests</p>
        </div>
        {user?.role !== 'admin' && (
          <button onClick={() => setShowRequestModal(true)} className="btn-primary text-xs sm:text-sm whitespace-nowrap">
            <Send size={15} /> Request Admin
          </button>
        )}
      </div>

      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium flex-shrink-0 ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            <tab.icon size={14} />
            <span>{tab.label}</span>
            {tab.count > 0 && <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-500' : 'bg-amber-100 text-amber-700'}`}>{tab.count}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-2 sm:space-y-3">
        {activeTab === 'funds' && (fundRequests.length === 0 ? <p className="text-sm text-slate-500 py-4 text-center">No fund requests.</p> : fundRequests.map(r => renderCard(r, 'fund')))}
        {activeTab === 'inventory' && (inventoryRequests.length === 0 ? <p className="text-sm text-slate-500 py-4 text-center">No inventory requests.</p> : inventoryRequests.map(r => renderCard(r, 'inventory')))}
      </div>

      {/* Modal to Request Admin */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <form onSubmit={handleSubmitRequest} className="modal-content p-4 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Request Admin Approval</h2>
              <button type="button" onClick={() => setShowRequestModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="form-label">Requested Amount ({getCurrencySymbol(user?.role)})</label>
                <input type="number" name="amount" className="form-input" placeholder={`${getCurrencySymbol(user?.role)}0`} required />
              </div>
              <div>
                <label className="form-label">Branch</label>
                <select name="branch" className="form-input" required>
                  {branches.filter(b => b.status === 'active').map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Reason / Justification</label>
                <textarea name="reason" className="form-input text-sm" rows={3} placeholder="Provide clear reason for the admin..." required />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setShowRequestModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">
                <Send size={15} /> Send to Admin
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
