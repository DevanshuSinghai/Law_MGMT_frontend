/**
 * Firms API endpoints
 */

import api from './client';

export const firmsApi = {
  // Get firm details
  get: async (id) => {
    const response = await api.get(`/firms/${id}/`);
    return response.data;
  },

  // Update firm
  update: async (id, data) => {
    const response = await api.put(`/firms/${id}/`, data);
    return response.data;
  },

  // Get firm members
  getMembers: async (firmId) => {
    const response = await api.get(`/firms/${firmId}/members/`);
    return response.data;
  },

  // Add member
  addMember: async (firmId, data) => {
    const response = await api.post(`/firms/${firmId}/members/`, data);
    return response.data;
  },

  // Update member
  updateMember: async (firmId, userId, data) => {
    const response = await api.put(`/firms/${firmId}/members/${userId}/`, data);
    return response.data;
  },

  // Toggle member status
  toggleMemberStatus: async (firmId, userId, isActive) => {
    const response = await api.patch(`/firms/${firmId}/members/${userId}/status/`, {
      is_active: isActive,
    });
    return response.data;
  },

  // Remove member
  removeMember: async (firmId, userId) => {
    await api.delete(`/firms/${firmId}/members/${userId}/`);
  },
};

export default firmsApi;
