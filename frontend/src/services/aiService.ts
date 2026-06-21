import api from './api';

export const aiService = {
  async generatePlan() {
    const response = await api.post('/ai/generate-plan');
    return response.data;
  },

  async calculateLoad() {
    const response = await api.post('/ai/calculate-load');
    return response.data;
  },

  async getTodayLoad() {
    const response = await api.get('/ai/load-today');
    return response.data;
  },
};