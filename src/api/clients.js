/**
 * Clients API endpoints
 */

import api from './client';

export const clientsApi = {
  // List clients
  list: async (params = {}) => {
    const response = await api.get('/clients/', { params });
    return response.data;
  },

  // Get single client
  get: async (id) => {
    const response = await api.get(`/clients/${id}/`);
    return response.data;
  },

  // Create client
  create: async (data) => {
    const response = await api.post('/clients/', data);
    return response.data;
  },

  // Update client
  update: async (id, data) => {
    const response = await api.put(`/clients/${id}/`, data);
    return response.data;
  },

  // Delete client
  delete: async (id) => {
    await api.delete(`/clients/${id}/`);
  },
};

export default clientsApi;
