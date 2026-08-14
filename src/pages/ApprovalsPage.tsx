import React, { useState } from 'react';
import { CheckCircle, XCircle, DollarSign, Package, FileText, ChevronDown } from 'lucide-react';
import { useDb } from '@/context/DbContext';

const specialRequests = [
  { id: 'SR001', employee: 'Lisa Anderson', type: 'Leave Extension', reason: 'Medical emergency', date: '2026-07-05', status: 'pending', remarks: '' },
  { id: 'SR002', employee: 'James Wilson', type: 'Equipment', reason: 'Need updated laptop', date: '2026-07-03', status: 'pending', remarks: '' },
];

export default function ApprovalsPage() {
  const { fundRequests, inventoryRequests, updateFundRequest, updateInventoryRequest } = useDb();
  const [activeTab, setActiveTab] = useState('funds');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');

  const tabs = [
    { id: 'funds', label: 'Funds', icon: DollarSign, count: fundRequests.filter(r => r.status === 'pending').length },
    { id: 'inventory', label: 'Inventory', icon: Package, count: inventoryRequests.filter(r => r.status === 'pending').length },
    { id: 'special', label: 'Special', icon: FileText, count: specialRequests.filter(r => r.status === 'pending').length },
  ];

  const handleAction = async (req: any, type: 'fund' | 'inventory' | 'special', status: 'approved' | 'rejected') => {
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

  const renderCard = (req: any, type: 'fund' | 'inventory' | 'special') => (
    <div key={req.id} className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-50" onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className={`p-2 sm:p-2.5 rounded-lg ${type === 'fund' ? 'bg-blue-100' : type === 'inventory' ? 'bg-emerald-100' : 'bg-violet-100'}`}>
            {type === 'fund' ? <DollarSign size={16} className="text-blue-600" /> : type === 'inventory' ? <Package size={16} className="text-emerald-600" /> : <FileText size={16} className="text-violet-600" />}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-700 text-xs sm:text-sm truncate">
              {type === 'fund' ? `£${req.amount.toLocaleString()}` : type === 'inventory' ? `${req.quantity} units (${req.product})` : req.type}
            </p>
            <p className="text-xs text-slate-500 truncate">{req.reason}</p>
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
            <div className="space-y-2 sm:space-y-3">
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add remarks..." className="form-input text-sm" rows={2} />
              <div className="flex gap-2">
                <button onClick={() => handleAction(req, type, 'approved')} className="btn-primary flex-1 text-xs sm:text-sm"><CheckCircle size={14} /> Approve</button>
                <button onClick={() => handleAction(req, type, 'rejected')} className="btn-danger flex-1 text-xs sm:text-sm"><XCircle size={14} /> Reject</button>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-600">{req.remarks || 'No remarks'}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="page-enter">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Approval Center</h1>
        <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Review and manage pending requests</p>
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
        {activeTab === 'funds' && fundRequests.map(r => renderCard(r, 'fund'))}
        {activeTab === 'inventory' && inventoryRequests.map(r => renderCard(r, 'inventory'))}
        {activeTab === 'special' && specialRequests.map(r => renderCard(r, 'special'))}
      </div>
    </div>
  );
}
