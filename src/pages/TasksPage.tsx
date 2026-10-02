import React, { useState, useMemo } from 'react';
import { Plus, X, Calendar, User, MoreVertical, Clock } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import { useAuth } from '@/context/AuthContext';
import type { Task } from '@/types';

const statusColumns = [
  { id: 'pending', title: 'Pending', color: 'bg-slate-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'on-hold', title: 'On Hold', color: 'bg-amber-100' },
  { id: 'completed', title: 'Done', color: 'bg-emerald-100' },
];

const priorityColors: Record<string, string> = {
  low: 'badge-slate',
  medium: 'badge-yellow',
  high: 'badge-red',
  critical: 'badge-purple',
};

export default function TasksPage() {
  const { tasks, employees, addTask, updateTask } = useDb();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editStatus, setEditStatus] = useState<Task['status']>('pending');

  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const isTaskAssignedToUser = (t: Task, u: any) => {
    if (!u || !t) return false;
    const uId = (u.id || '').toLowerCase();
    const uEmail = (u.email || '').toLowerCase();
    const uName = (u.name || '').toLowerCase();

    const tAssignedTo = (t.assignedTo || '').toLowerCase();
    const tAssignedName = (t.assignedToName || '').toLowerCase();

    if (tAssignedTo && uId && tAssignedTo === uId) return true;
    if (tAssignedTo && uEmail && tAssignedTo === uEmail) return true;
    if (tAssignedName && uName && tAssignedName === uName) return true;

    // Check matching record in employees array
    const empRecord = employees.find(e =>
      (uId && (e.id || '').toLowerCase() === uId) ||
      (uEmail && (e.email || '').toLowerCase() === uEmail) ||
      (uName && (e.name || '').toLowerCase() === uName)
    );

    if (empRecord) {
      if (tAssignedTo === (empRecord.id || '').toLowerCase() || tAssignedTo === (empRecord.email || '').toLowerCase()) return true;
      if (tAssignedName === (empRecord.name || '').toLowerCase()) return true;
    }

    return false;
  };

  // Filter tasks strictly by role:
  // Admin: All tasks
  // Supervisor: ONLY tasks assigned to this supervisor
  // Employee: ONLY tasks assigned to this employee
  const visibleTasks = useMemo(() => {
    if (!user || user.role === 'admin') return tasks;

    return tasks.filter(t => isTaskAssignedToUser(t, user));
  }, [tasks, user, employees]);

  const getTasksByStatus = (status: Task['status']) => visibleTasks.filter(t => t.status === status);

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const employeeId = formData.get('assignedTo') as string;
    const empName = employees.find(emp => emp.id === employeeId)?.name || 'Unknown';
    const createdDate = (formData.get('createdDate') as string) || todayDateStr;

    const taskData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as any,
      status: 'pending' as const,
      assignedTo: employeeId,
      assignedToName: empName,
      createdDate,
      dueDate: formData.get('dueDate') as string,
      progress: 0,
      notes: (formData.get('notes') as string || '').trim()
    };

    try {
      await addTask(taskData);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTask) return;
    try {
      const progress = editStatus === 'completed' ? 100 : selectedTask.progress;
      await updateTask(selectedTask.id, { status: editStatus, progress });
      setSelectedTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setEditStatus(task.status);
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Tasks</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Manage and track team tasks</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary w-full sm:w-auto">
          <Plus size={16} /> <span>Create Task</span>
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-3 px-3 sm:mx-0 sm:px-0 lg:gap-4">
        {statusColumns.map(column => (
          <div key={column.id} className={`${column.color} rounded-lg sm:rounded-xl p-2 sm:p-3 min-w-[260px] sm:min-w-[280px] lg:min-w-0 flex-1`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-700">{column.title}</h3>
              <span className="text-xs bg-white text-slate-600 px-2 py-0.5 rounded-full">
                {getTasksByStatus(column.id as Task['status']).length}
              </span>
            </div>
            <div className="space-y-2 sm:space-y-3 max-h-[60vh] overflow-y-auto">
              {getTasksByStatus(column.id as Task['status']).map(task => (
                <div
                  key={task.id}
                  onClick={() => handleOpenTaskDetails(task)}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                    <h4 className="text-xs sm:text-sm font-medium text-slate-800 line-clamp-2">{task.title}</h4>
                    <button className="p-1 hover:bg-slate-100 rounded text-slate-400 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <MoreVertical size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2 hidden sm:block">{task.description}</p>
                  <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
                    <span className={`${priorityColors[task.priority]} text-xs`}>{task.priority}</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0">
                        <User size={10} className="flex-shrink-0" />
                        <span className="truncate">{task.assignedToName.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={10} />
                        <span>Created: {task.createdDate || todayDateStr}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-slate-600 font-medium">
                      <Calendar size={10} />
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                  {task.status !== 'pending' && task.status !== 'completed' && (
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-slate-600">{task.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${task.progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && !selectedTask && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form onSubmit={handleCreateTask} className="modal-content p-4 sm:p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Create Task</h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="form-label">Task Title</label>
                <input type="text" name="title" placeholder="Enter task title" className="form-input" required />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input" rows={2} placeholder="Task description..." required />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="form-label">Priority</label>
                  <select name="priority" className="form-input">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Created Date</label>
                  <input type="date" name="createdDate" className="form-input bg-slate-50 text-slate-600" defaultValue={todayDateStr} required />
                </div>
              </div>
              <div>
                <label className="form-label">Due Date</label>
                <input type="date" name="dueDate" className="form-input" defaultValue={todayDateStr} required />
              </div>
              <div>
                <label className="form-label">Assign To</label>
                <select name="assignedTo" className="form-input" required>
                  <option value="">Select employee</option>
                  {employees.filter(e => e.status === 'active').map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Notes / Special Instructions</label>
                <textarea name="notes" className="form-input text-xs sm:text-sm" rows={2} placeholder="Add any special task notes..." />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Create</button>
            </div>
          </form>
        </div>
      )}

      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content p-4 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className={`${priorityColors[selectedTask.priority]} text-xs`}>{selectedTask.priority}</span>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">{selectedTask.title}</h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">{selectedTask.description}</p>

            {selectedTask.notes && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg mb-4 text-xs">
                <span className="font-semibold text-blue-900 block">📝 Notes:</span>
                <span className="text-blue-800">{selectedTask.notes}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg mb-4 text-xs">
              <div>
                <span className="block text-slate-400">Assigned To</span>
                <span className="font-medium text-slate-700 truncate block">{selectedTask.assignedToName}</span>
              </div>
              <div>
                <span className="block text-slate-400">Created Date</span>
                <span className="font-medium text-slate-700 block">{selectedTask.createdDate || todayDateStr}</span>
              </div>
              <div>
                <span className="block text-slate-400">Due Date</span>
                <span className="font-medium text-slate-700 block">{selectedTask.dueDate}</span>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <select className="form-input flex-1 text-xs sm:text-sm" value={editStatus} onChange={e => setEditStatus(e.target.value as any)}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
              <button onClick={handleUpdateStatus} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

