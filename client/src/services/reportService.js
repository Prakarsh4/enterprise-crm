import api from './api';

export const reportService = {
  getSummary: (params) => api.get('/reports/summary', { params })
};