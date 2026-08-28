// client/src/pages/Deals.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { dealService } from '../services/dealservice';
import { customerService } from '../services/customerservice';
import { authService } from '../services/authservice';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const STAGES = [
  { key: 'prospecting', label: 'Prospecting' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'closed_won', label: 'Closed Won' },
  { key: 'closed_lost', label: 'Closed Lost' }
];

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dealToDelete, setDealToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    customer: '',
    value: '',
    stage: 'prospecting',
    probability: 20,
    expectedCloseDate: '',
    assignedTo: '',
    notes: ''
  });

  const { addToast } = useToast();

  const fetchDependencies = async () => {
    try {
      const [custRes, userRes] = await Promise.all([
        customerService.getAll({ limit: 100 }),
        authService.getUsers()
      ]);
      setCustomers(custRes.data);
      setUsers(userRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dealService.getAll();
      setDeals(res.data);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDependencies();
    fetchDeals();
  }, [fetchDeals]);

  const handleOpenCreateModal = () => {
    setSelectedDeal(null);
    setFormData({
      title: '',
      customer: customers[0]?._id || '',
      value: '',
      stage: 'prospecting',
      probability: 20,
      expectedCloseDate: '',
      assignedTo: users[0]?._id || '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (deal) => {
    setSelectedDeal(deal);
    setFormData({
      title: deal.title,
      customer: deal.customer?._id || '',
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.substring(0, 10) : '',
      assignedTo: deal.assignedTo?._id || '',
      notes: deal.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedDeal) {
        await dealService.update(selectedDeal._id, formData);
        addToast('Deal updated successfully', 'success');
      } else {
        await dealService.create(formData);
        addToast('Deal created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchDeals();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleStageChange = async (dealId, newStage) => {
    try {
      await dealService.update(dealId, { stage: newStage });
      addToast('Stage progressed', 'success');
      fetchDeals();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await dealService.delete(dealToDelete._id);
      addToast('Deal deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      fetchDeals();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sales Pipeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track opportunities and monetary value across sales lifecycle</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal}>
          <Plus size={16} className="mr-1.5" /> Create Deal
        </Button>
      </div>

      {/* Stage Buckets (Kanban-ready Foundation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.key);
          const stageTotal = stageDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);

          return (
            <div key={stage.key} className="bg-slate-100/80 rounded-xl p-3 flex flex-col border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{stage.label}</span>
                <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full font-semibold text-slate-600">
                  {stageDeals.length}
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 mb-3">
                Value: <span className="font-bold text-slate-800">${stageTotal.toLocaleString()}</span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[65vh]">
                {stageDeals.map((deal) => (
                  <div
                    key={deal._id}
                    className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2">{deal.title}</h4>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(deal)}
                          className="text-slate-400 hover:text-brand-600"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setDealToDelete(deal);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      {deal.customer?.company || deal.customer?.name}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-brand-700">
                        ${Number(deal.value).toLocaleString()}
                      </span>
                      <Badge variant="default">{deal.probability}%</Badge>
                    </div>

                    {/* Quick Move Select */}
                    <div className="mt-2.5">
                      <select
                        value={deal.stage}
                        onChange={(e) => handleStageChange(deal._id, e.target.value)}
                        className="w-full text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-600 focus:outline-none"
                      >
                        {STAGES.map((s) => (
                          <option key={s.key} value={s.key}>
                            Move: {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Deal Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedDeal ? 'Edit Deal' : 'New Deal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Deal Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Customer Account"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              options={customers.map((c) => ({ value: c._id, label: `${c.name} (${c.company})` }))}
              required
            />
            <Input
              label="Value ($ USD)"
              type="number"
              min="0"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Stage"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              options={STAGES.map((s) => ({ value: s.key, label: s.label }))}
            />
            <Input
              label="Win Probability (%)"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Expected Close Date"
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
            />
            <Select
              label="Assigned To"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              options={users.map((u) => ({ value: u._id, label: u.name }))}
            />
          </div>
          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Deal Notes & Strategic Context
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {selectedDeal ? 'Save Changes' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Opportunity"
        message={`Are you sure you want to remove deal "${dealToDelete?.title}"?`}
      />
    </div>
  );
};

export default Deals;
