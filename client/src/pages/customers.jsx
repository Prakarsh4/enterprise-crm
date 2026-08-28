// client/src/pages/Customers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { customerService } from '../services/customerservice';
import { authService } from '../services/authservice';
import { useToast } from '../context/ToastContext';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import Badge from '../components/common/Badge';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: 'Technology',
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

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;

      const res = await customerService.getAll(params);
      setCustomers(res.data);
      setPagination(res.pagination);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, addToast]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenCreateModal = () => {
    setSelectedCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      industry: 'Technology',
      assignedTo: users[0]?._id || '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.company || '',
      industry: customer.industry || 'Technology',
      assignedTo: customer.assignedTo?._id || '',
      notes: customer.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCustomer) {
        await customerService.update(selectedCustomer._id, formData);
        addToast('Customer record updated', 'success');
      } else {
        await customerService.create(formData);
        addToast('Customer record created', 'success');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await customerService.delete(customerToDelete._id);
      addToast('Customer deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      fetchCustomers();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Account / Name',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.name}</div>
          <div className="text-xs text-slate-400">{row.email}</div>
        </div>
      )
    },
    { header: 'Company', accessor: 'company' },
    {
      header: 'Industry',
      render: (row) => <Badge variant="primary">{row.industry}</Badge>
    },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Account Executive',
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
              setCustomerToDelete(row);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Customers Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Maintain verified enterprise accounts and accounts management</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal}>
          <Plus size={16} className="mr-1.5" /> Add Customer
        </Button>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <Table columns={columns} data={customers} isLoading={loading} emptyMessage="No customers found" />
      <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Customer / Company Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
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
              label="Company Group"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              options={[
                { value: 'Technology', label: 'Technology' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Healthcare', label: 'Healthcare' },
                { value: 'Manufacturing', label: 'Manufacturing' },
                { value: 'Retail', label: 'Retail' },
                { value: 'Education', label: 'Education' },
                { value: 'Services', label: 'Services' },
                { value: 'Other', label: 'Other' }
              ]}
            />
            <Select
              label="Assigned Executive"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              options={users.map((u) => ({ value: u._id, label: `${u.name}` }))}
            />
          </div>
          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Account Notes
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
              {selectedCustomer ? 'Save Changes' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customerToDelete?.name}? Associated historical records will remain.`}
      />
    </div>
  );
};

export default Customers;
