/**
 * Documents API endpoints
 */

import api from './client';

export const documentsApi = {
  // List documents
  list: async (params = {}) => {
    const response = await api.get('/documents/', { params });
    return response.data;
  },

  // Get single document
  get: async (id) => {
    const response = await api.get(`/documents/${id}/`);
    return response.data;
  },

  // Upload document
  upload: async (caseId, file, title, category = 'other', description = '', tags = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', caseId);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('tags', tags);

    const response = await api.post('/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update document metadata
  update: async (id, data) => {
    const response = await api.put(`/documents/${id}/`, data);
    return response.data;
  },

  // Delete document
  delete: async (id) => {
    await api.delete(`/documents/${id}/`);
  },

  // Download document
  download: async (id) => {
    const response = await api.get(`/documents/${id}/download/`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get document versions
  getVersions: async (id) => {
    const response = await api.get(`/documents/${id}/versions/`);
    return response.data;
  },

  // Upload new version
  uploadVersion: async (id, file, changeNotes = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('change_notes', changeNotes);

    const response = await api.post(`/documents/${id}/versions/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default documentsApi;
