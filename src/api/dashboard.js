/**
 * Dashboard API endpoints
 */

import api from './client';

export const dashboardApi = {
  // Get dashboard stats
  getStats: async () => {
    const response = await api.get('/dashboard/stats/');
    return response.data;
  },

  // Get upcoming deadlines
  getDeadlines: async (days = 7) => {
    const response = await api.get('/dashboard/upcoming-deadlines/', {
      params: { days },
    });
    return response.data;
  },

  // Get recent activity
  getActivity: async (limit = 20) => {
    const response = await api.get('/dashboard/recent-activity/', {
      params: { limit },
    });
    return response.data;
  },
};

export default dashboardApi;
