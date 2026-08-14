import React, { useState } from 'react';
import { Plus, X, Calendar, User, MoreVertical } from 'lucide-react';
import { useDb } from '@/context/DbContext';
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
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editStatus, setEditStatus] = useState<Task['status']>('pending');

  const getTasksByStatus = (status: Task['status']) => tasks.filter(t => t.status === status);

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const employeeId = formData.get('assignedTo') as string;
    const empName = employees.find(emp => emp.id === employeeId)?.name || 'Unknown';

    const taskData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as any,
      status: 'pending' as const,
      assignedTo: employeeId,
      assignedToName: empName,
      dueDate: formData.get('dueDate') as string,
      progress: 0
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
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1 min-w-0">
                      <User size={10} className="flex-shrink-0" />
                      <span className="truncate">{task.assignedToName.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      <span>{task.dueDate.slice(5)}</span>
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
                  <label className="form-label">Due Date</label>
                  <input type="date" name="dueDate" className="form-input" required />
                </div>
              </div>
              <div>
                <label className="form-label">Assign To</label>
                <select name="assignedTo" className="form-input" required>
                  <option value="">Select employee</option>
                  {employees.filter(e => e.status === 'active').map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
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
            <div className="grid grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg mb-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span className="text-slate-600 truncate">{selectedTask.assignedToName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-slate-600">{selectedTask.dueDate}</span>
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

