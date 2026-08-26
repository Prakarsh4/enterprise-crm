// client/src/pages/Leads.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { leadService } from '../services/leadservice';
import { authService } from '../services/authservice';
import { useToast } from '../context/Toastcontext';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import Badge from '../components/common/Badge';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'new',
    assignedTo: '',
    notes: ''
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

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await leadService.getAll(params);
      setLeads(res.data);
      setPagination(res.pagination);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, addToast]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleOpenCreateModal = () => {
    setSelectedLead(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      source: 'Website',
      status: 'new',
      assignedTo: users[0]?._id || '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || 'Website',
      status: lead.status || 'new',
      assignedTo: lead.assignedTo?._id || '',
      notes: lead.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLead) {
        await leadService.update(selectedLead._id, formData);
        addToast('Lead updated successfully', 'success');
      } else {
        await leadService.create(formData);
        addToast('Lead created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await leadService.delete(leadToDelete._id);
      addToast('Lead deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      fetchLeads();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      new: 'primary',
      contacted: 'warning',
      qualified: 'purple',
      unqualified: 'danger',
      converted: 'success'
    };
    return <Badge variant={map[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  const columns = [
    {
      header: 'Name',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{`${row.firstName} ${row.lastName}`}</div>
          <div className="text-xs text-slate-400">{row.email}</div>
        </div>
      )
    },
    { header: 'Company', accessor: 'company' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Status', render: (row) => getStatusBadge(row.status) },
    {
      header: 'Assigned To',
      render: (row) => row.assignedTo?.name || <span className="text-slate-400">Unassigned</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setLeadToDelete(row);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Leads Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Prospect intake, qualification, and sales rep allocation</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal}>
          <Plus size={16} className="mr-1.5" /> Add Lead
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, email, or company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="unqualified">Unqualified</option>
            <option value="converted">Converted</option>
          </select>
        </div>
      </div>

      {/* Table & Pagination */}
      <Table columns={columns} data={leads} isLoading={loading} emptyMessage="No leads found" />
      <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLead ? 'Edit Lead' : 'Create New Lead'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Lead Source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              options={[
                { value: 'Website', label: 'Website' },
                { value: 'Referral', label: 'Referral' },
                { value: 'Cold Call', label: 'Cold Call' },
                { value: 'LinkedIn', label: 'LinkedIn' },
                { value: 'Event', label: 'Event' },
                { value: 'Other', label: 'Other' }
              ]}
            />
            <Select
              label="Lead Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'new', label: 'New' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'qualified', label: 'Qualified' },
                { value: 'unqualified', label: 'Unqualified' },
                { value: 'converted', label: 'Converted' }
              ]}
            />
          </div>
          <Select
            label="Assigned Representative"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            options={users.map((u) => ({ value: u._id, label: `${u.name} (${u.role})` }))}
          />
          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Notes
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
              {selectedLead ? 'Save Changes' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to permanently delete lead ${leadToDelete?.firstName} ${leadToDelete?.lastName}?`}
      />
    </div>
  );
};

export default Leads;