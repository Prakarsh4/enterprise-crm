// client/src/services/activityService.js
import api from './api';

export const activityService = {
  getAll: (params) => api.get('/activities', { params }),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`)
};