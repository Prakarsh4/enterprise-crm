import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    if (!window.confirm('Change this user\'s role?')) return;
    try {
      await userService.updateRole(id, newRole);
      addToast('User role updated', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;
    try {
      await userService.toggleStatus(id, !currentStatus);
      addToast(`User ${!currentStatus ? 'activated' : 'deactivated'}`, 'info');
      fetchUsers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">User & Access Management</h2>
        <p className="text-xs text-slate-500 mt-0.5">Admin control panel for staff access and role permissions</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{u.name}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1"
                  >
                    <option value="sales_rep">Sales Representative</option>
                    <option value="manager">Sales Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.isActive !== false ? 'success' : 'danger'}>
                    {u.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusToggle(u._id, u.isActive !== false)}
                  >
                    {u.isActive !== false ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
