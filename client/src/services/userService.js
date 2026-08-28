import api from './api';

export const userService = {
  getAll: () => api.get('/users'),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  toggleStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive })
};