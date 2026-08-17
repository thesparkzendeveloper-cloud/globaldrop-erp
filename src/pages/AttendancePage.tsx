import React, { useState } from 'react';
import { LogIn, LogOut, Calendar, Users, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useDb } from '@/context/DbContext';

const IST = 'Asia/Kolkata';

// Get current time in IST as HH:MM
const getCurrentIST = (): string => {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: IST,
  }).format(new Date());
};

// Format HH:MM → "09:30 AM"
const formatTime = (time?: string): string => {
  if (!time || time === '--:--') return '--:--';
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr ?? '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
};

export default function AttendancePage() {
  const { attendanceRecords, employees, checkInEmployee, checkOutEmployee } = useDb();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'checkIn' | 'checkOut'>('checkIn');
  const openModal = (type: 'checkIn' | 'checkOut') => {
    setModalType(type);
    setShowModal(true);
  };

  const dailyRecords = attendanceRecords.filter(a => a.date === date);

  const stats = {
    present: dailyRecords.filter(a => a.status === 'present').length,
    absent:  dailyRecords.filter(a => a.status === 'absent').length,
    late:    dailyRecords.filter(a => a.status === 'late').length,
    total:   dailyRecords.length,
  };

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const employeeId = formData.get('employeeId') as string;
    const empName = employees.find(emp => emp.id === employeeId)?.name || 'Unknown';
    try {
      if (modalType === 'checkIn') {
        await checkInEmployee(employeeId, empName);
      } else {
        await checkOutEmployee(employeeId);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Attendance</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Track employee attendance and check-ins</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:pb-0">
          {/* IST live clock badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap">
            <Clock size={13} />
            IST {formatTime(getCurrentIST())}
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 sm:p-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="text-xs sm:text-sm text-slate-700 focus:outline-none bg-transparent"
            />
          </div>
          <button onClick={() => openModal('checkIn')} className="btn-primary text-xs sm:text-sm whitespace-nowrap">
            <LogIn size={14} /> Check-In
          </button>
          <button onClick={() => openModal('checkOut')} className="btn-secondary text-xs sm:text-sm whitespace-nowrap">
            <LogOut size={14} /> Check-Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg sm:rounded-xl">
              <CheckCircle size={18} className="text-emerald-600 sm:hidden" />
              <CheckCircle size={24} className="text-emerald-600 hidden sm:block" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Present</p>
              <p className="text-xl sm:text-2xl font-semibold text-emerald-600">{stats.present}</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg sm:rounded-xl">
              <AlertCircle size={18} className="text-red-600 sm:hidden" />
              <AlertCircle size={24} className="text-red-600 hidden sm:block" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Absent</p>
              <p className="text-xl sm:text-2xl font-semibold text-red-600">{stats.absent}</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-amber-100 rounded-lg sm:rounded-xl">
              <Clock size={18} className="text-amber-600 sm:hidden" />
              <Clock size={24} className="text-amber-600 hidden sm:block" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Late</p>
              <p className="text-xl sm:text-2xl font-semibold text-amber-600">{stats.late}</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-slate-100 rounded-lg sm:rounded-xl">
              <Users size={18} className="text-slate-600 sm:hidden" />
              <Users size={24} className="text-slate-600 hidden sm:block" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Total</p>
              <p className="text-xl sm:text-2xl font-semibold text-slate-700">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <p className="text-xs sm:text-sm font-medium text-slate-700">Attendance for {date}</p>
          <span className="text-xs text-slate-500">
            {stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(0) : '0'}% rate
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="table-header">Employee</th>
                <th className="table-header">Check In (IST)</th>
                <th className="table-header">Check Out (IST)</th>
                <th className="table-header hidden sm:table-cell">Hours</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-cell text-center text-slate-500 py-6">
                    No attendance records found for this date.
                  </td>
                </tr>
              ) : (
                dailyRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    {/* Employee */}
                    <td className="table-cell">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {record.employeeName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-xs sm:text-sm truncate">{record.employeeName}</span>
                      </div>
                    </td>

                    {/* Check In */}
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <LogIn size={13} className={record.checkIn ? 'text-emerald-500' : 'text-slate-300'} />
                        <span className={`text-xs sm:text-sm font-semibold ${record.checkIn ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {formatTime(record.checkIn)}
                        </span>
                      </div>
                    </td>

                    {/* Check Out */}
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <LogOut size={13} className={record.checkOut ? 'text-red-400' : 'text-slate-300'} />
                        <span className={`text-xs sm:text-sm font-semibold ${record.checkOut ? 'text-red-600' : 'text-slate-400'}`}>
                          {formatTime(record.checkOut)}
                        </span>
                      </div>
                    </td>

                    {/* Working Hours */}
                    <td className="table-cell hidden sm:table-cell">
                      {record.workingHours && record.workingHours !== '0' ? (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          <Clock size={11} />{record.workingHours}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="table-cell">
                      <span className={
                        record.status === 'present' ? 'badge-green' :
                        record.status === 'late'    ? 'badge-yellow' : 'badge-red'
                      }>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form onSubmit={handleManualSubmit} className="modal-content p-4 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                Manual {modalType === 'checkIn' ? 'Check-In' : 'Check-Out'}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* IST banner */}
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 mb-4">
              <Clock size={13} />
              Current IST: <strong>{formatTime(getCurrentIST())}</strong> (India Standard Time, UTC+5:30)
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="form-label">Employee</label>
                <select name="employeeId" className="form-input" required>
                  <option value="">Select employee</option>
                  {employees.filter(e => e.status === 'active').map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Date</label>
                <input type="date" name="date" value={date} className="form-input" onChange={e => setDate(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Remarks (Optional)</label>
                <textarea name="remarks" className="form-input text-sm" rows={2} placeholder="Any notes or remarks..." />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">
                <LogIn size={16} /> Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
