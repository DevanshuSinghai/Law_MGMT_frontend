/**
 * Cases API endpoints
 */

import api from './client';

export const casesApi = {
  // List cases with filters
  list: async (params = {}) => {
    const response = await api.get('/cases/', { params });
    return response.data;
  },

  // Get single case
  get: async (id) => {
    const response = await api.get(`/cases/${id}/`);
    return response.data;
  },

  // Create case
  create: async (data) => {
    const response = await api.post('/cases/', data);
    return response.data;
  },

  // Update case
  update: async (id, data) => {
    const response = await api.put(`/cases/${id}/`, data);
    return response.data;
  },

  // Delete case
  delete: async (id) => {
    await api.delete(`/cases/${id}/`);
  },

  // Get case assignments
  getAssignments: async (caseId) => {
    const response = await api.get(`/cases/${caseId}/assignments/`);
    return response.data;
  },

  // Add assignment
  addAssignment: async (caseId, data) => {
    const response = await api.post(`/cases/${caseId}/assignments/`, data);
    return response.data;
  },

  // Remove assignment
  removeAssignment: async (caseId, assignmentId) => {
    await api.delete(`/cases/${caseId}/assignments/${assignmentId}/`);
  },

  // Get case notes
  getNotes: async (caseId) => {
    const response = await api.get(`/cases/${caseId}/notes/`);
    return response.data;
  },

  // Add note
  addNote: async (caseId, data) => {
    const response = await api.post(`/cases/${caseId}/notes/`, data);
    return response.data;
  },

  // Delete note
  deleteNote: async (caseId, noteId) => {
    await api.delete(`/cases/${caseId}/notes/${noteId}/`);
  },
};

// Case Types API
export const caseTypesApi = {
  list: async () => {
    const response = await api.get('/case-types/');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/case-types/', data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/case-types/${id}/`);
  },
};

export default casesApi;
