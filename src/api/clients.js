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

  // Fetch all clients for dropdown selection without pagination
  listAll: async (params = {}) => {
    const response = await api.get('/clients/select/', { params });
    return response.data;
  },
  
  // Get single client
  get: async (id) => {
    const response = await api.get(`/clients/${id}/`);
    return response.data;
  },

  // Create client
  create: async (data) => {
    try{
      const response = await api.post('/clients/', data);
      return response.data;
    } catch(error){
      alert(error.response.data.name[0])
    }
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
