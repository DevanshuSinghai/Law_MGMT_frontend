/**
 * Tasks API endpoints
 */

import api from './client';

export const tasksApi = {
  // List tasks
  list: async (params = {}) => {
    const response = await api.get('/tasks/', { params });
    return response.data;
  },

  // Get my tasks
  myTasks: async (params = {}) => {
    const response = await api.get('/tasks/my-tasks/', { params });
    return response.data;
  },

  // Get single task
  get: async (id) => {
    const response = await api.get(`/tasks/${id}/`);
    return response.data;
  },

  // Create task
  create: async (data) => {
    const response = await api.post('/tasks/', data);
    return response.data;
  },

  // Update task
  update: async (id, data) => {
    const response = await api.patch(`/tasks/${id}/`, data);
    return response.data;
  },

  // Delete task
  delete: async (id) => {
    await api.delete(`/tasks/${id}/`);
  },

  // Complete task
  complete: async (id) => {
    const response = await api.post(`/tasks/${id}/complete/`);
    return response.data;
  },
};

export default tasksApi;
