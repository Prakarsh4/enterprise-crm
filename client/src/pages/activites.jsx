// client/src/pages/Activities.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { activityService } from '../services/activityservice';
import { authService } from '../services/authservice';
import { useToast } from '../context/Toastcontext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, CheckCircle2, Circle, Trash2, Phone, Mail, Calendar, CheckSquare, FileText } from 'lucide-react';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: 'call',
    title: '',
    description: '',
    dueDate: '',
    assignedTo: ''
  });

  const { addToast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await authService.getUsers();
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityService.getAll();
      setActivities(res.data);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
    fetchActivities();
  }, [fetchActivities]);

  const handleOpenCreateModal = () => {
    setFormData({
      type: 'call',
      title: '',
      description: '',
      dueDate: '',
      assignedTo: users[0]?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await activityService.create(formData);
      addToast('Activity logged successfully', 'success');
      setIsModalOpen(false);
      fetchActivities();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const toggleComplete = async (act) => {
    try {
      await activityService.update(act._id, { completed: !act.completed });
      addToast(act.completed ? 'Activity reopened' : 'Activity completed', 'info');
      fetchActivities();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await activityService.delete(id);
      addToast('Activity deleted', 'success');
      fetchActivities();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'call':
        return <Phone size={14} className="text-blue-500" />;
      case 'email':
        return <Mail size={14} className="text-amber-500" />;
      case 'meeting':
        return <Calendar size={14} className="text-purple-500" />;
      case 'task':
        return <CheckSquare size={14} className="text-emerald-500" />;
      default:
        return <FileText size={14} className="text-slate-500" />;
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const pendingActivities = activities.filter((a) => !a.completed);
  const completedActivities = activities.filter((a) => a.completed);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Activity Log & Tasks</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track calls, meetings, tasks, and client follow-ups</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal}>
          <Plus size={16} className="mr-1.5" /> Log Activity
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Activities */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Upcoming & Pending ({pendingActivities.length})
            </h3>
          </div>

          <div className="space-y-3">
            {pendingActivities.length > 0 ? (
              pendingActivities.map((act) => (
                <div key={act._id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleComplete(act)} className="mt-0.5 text-slate-400 hover:text-emerald-600">
                      <Circle size={18} />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(act.type)}
                        <span className="text-sm font-semibold text-slate-800">{act.title}</span>
                      </div>
                      {act.description && <p className="text-xs text-slate-500 mt-1">{act.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span>Assigned: {act.assignedTo?.name}</span>
                        {act.dueDate && <span>Due: {new Date(act.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(act._id)} className="text-slate-400 hover:text-rose-600 p-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No pending activities scheduled.</p>
            )}
          </div>
        </div>

        {/* Completed Activities */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Completed Log ({completedActivities.length})
            </h3>
          </div>

          <div className="space-y-3">
            {completedActivities.length > 0 ? (
              completedActivities.map((act) => (
                <div key={act._id} className="p-3.5 rounded-lg border border-slate-200 bg-emerald-50/30 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleComplete(act)} className="mt-0.5 text-emerald-600 hover:text-slate-400">
                      <CheckCircle2 size={18} />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(act.type)}
                        <span className="text-sm font-semibold text-slate-600 line-through">{act.title}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        <span>Completed by {act.assignedTo?.name}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(act._id)} className="text-slate-400 hover:text-rose-600 p-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No completed activities yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log CRM Activity">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Activity Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'call', label: 'Phone Call' },
                { value: 'email', label: 'Email Follow-up' },
                { value: 'meeting', label: 'Client Meeting' },
                { value: 'task', label: 'Task' },
                { value: 'note', label: 'Internal Note' }
              ]}
            />
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <Input
            label="Title / Subject"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Select
            label="Assigned To"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            options={users.map((u) => ({ value: u._id, label: u.name }))}
          />
          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Description & Notes
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Activity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Activities;