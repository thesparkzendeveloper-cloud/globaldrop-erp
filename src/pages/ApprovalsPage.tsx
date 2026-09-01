import React, { useState } from 'react';
import { CheckCircle, XCircle, DollarSign, Package, FileText, ChevronDown, Plus, X, Send } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import { useAuth } from '@/context/AuthContext';

export default function ApprovalsPage() {
  const { fundRequests, inventoryRequests, updateFundRequest, updateInventoryRequest, addFundRequest, branches } = useDb();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('funds');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<'fund' | 'special'>('fund');

  // Local state for custom special requests
  const [specialReqList, setSpecialReqList] = useState([
    { id: 'SR001', employee: 'Lisa Anderson', type: 'Leave Extension', reason: 'Medical emergency', date: '2026-07-05', status: 'pending', remarks: '' },
    { id: 'SR002', employee: 'James Wilson', type: 'Equipment', reason: 'Need updated laptop', date: '2026-07-03', status: 'pending', remarks: '' },
  ]);

  const tabs = [
    { id: 'funds', label: 'Funds', icon: DollarSign, count: fundRequests.filter(r => r.status === 'pending').length },
    { id: 'inventory', label: 'Inventory', icon: Package, count: inventoryRequests.filter(r => r.status === 'pending').length },
    { id: 'special', label: 'Special', icon: FileText, count: specialReqList.filter(r => r.status === 'pending').length },
  ];

  const handleAction = async (req: any, type: 'fund' | 'inventory' | 'special', status: 'approved' | 'rejected') => {
    try {
      if (type === 'fund') {
        await updateFundRequest(req.id, { status, remarks });
      } else if (type === 'inventory') {
        await updateInventoryRequest(req.id, { status, remarks });
      } else if (type === 'special') {
        setSpecialReqList(prev => prev.map(s => s.id === req.id ? { ...s, status, remarks } : s));
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

    if (requestType === 'fund') {
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
    } else {
      const title = formData.get('title') as string;
      const reason = formData.get('reason') as string;
      const newSpecial = {
        id: 'SR' + Math.floor(100 + Math.random() * 900),
        employee: user?.name || 'Supervisor',
        type: title,
        reason,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        remarks: ''
      };
      setSpecialReqList(prev => [newSpecial, ...prev]);
    }

    setShowRequestModal(false);
  };

  const renderCard = (req: any, type: 'fund' | 'inventory' | 'special') => (
    <div key={req.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className={`p-2 sm:p-2.5 rounded-lg ${type === 'fund' ? 'bg-blue-100' : type === 'inventory' ? 'bg-emerald-100' : 'bg-violet-100'}`}>
            {type === 'fund' ? <DollarSign size={16} className="text-blue-600" /> : type === 'inventory' ? <Package size={16} className="text-emerald-600" /> : <FileText size={16} className="text-violet-600" />}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-800 text-xs sm:text-sm truncate">
              {type === 'fund' ? `₹${req.amount?.toLocaleString()}` : type === 'inventory' ? `${req.quantity} units (${req.product})` : req.type}
            </p>
            <p className="text-xs text-slate-500 truncate">{req.reason}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Requested by: <strong className="text-slate-600">{req.requestedBy || req.employee || 'User'}</strong>
              {req.requestDate || req.date ? ` · ${req.requestDate || req.date}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`badge ${req.status === 'pending' ? 'badge-yellow' : req.status === 'approved' ? 'badge-green' : 'badge-red'}`}>{req.status}</span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded === req.id ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {expanded === req.id && (
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
          {req.status === 'pending' ? (
            user?.role === 'admin' ? (
              <div className="space-y-2 sm:space-y-3">
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add remarks..." className="form-input text-sm" rows={2} />
                <div className="flex gap-2">
                  <button onClick={() => handleAction(req, type, 'approved')} className="btn-primary flex-1 text-xs sm:text-sm"><CheckCircle size={14} /> Approve</button>
                  <button onClick={() => handleAction(req, type, 'rejected')} className="btn-danger flex-1 text-xs sm:text-sm"><XCircle size={14} /> Reject</button>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                ⏳ Request submitted to Admin. Awaiting approval.
              </p>
            )
          ) : (
            <p className="text-xs sm:text-sm text-slate-600">Remarks: {req.remarks || 'No remarks provided'}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Approval Center</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Review and manage pending requests</p>
        </div>
        <button onClick={() => setShowRequestModal(true)} className="btn-primary text-xs sm:text-sm whitespace-nowrap">
          <Send size={15} /> Request Admin
        </button>
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
        {activeTab === 'special' && (specialReqList.length === 0 ? <p className="text-sm text-slate-500 py-4 text-center">No special requests.</p> : specialReqList.map(r => renderCard(r, 'special')))}
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
                <label className="form-label">Request Category</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestType('fund')}
                    className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${requestType === 'fund' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                  >
                    💰 Fund / Budget
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType('special')}
                    className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${requestType === 'special' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                  >
                    📝 Special / Equipment
                  </button>
                </div>
              </div>

              {requestType === 'fund' ? (
                <>
                  <div>
                    <label className="form-label">Requested Amount (₹)</label>
                    <input type="number" name="amount" className="form-input" placeholder="e.g. 5000" required />
                  </div>
                  <div>
                    <label className="form-label">Branch</label>
                    <select name="branch" className="form-input" required>
                      {branches.filter(b => b.status === 'active').map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="form-label">Request Title / Item</label>
                  <input type="text" name="title" className="form-input" placeholder="e.g. Equipment, Software license, Leave extension" required />
                </div>
              )}

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
