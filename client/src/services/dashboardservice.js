// client/src/services/dashboardService.js
import api from './api';

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
};