/**
 * Micro-Tools admin API — generic CRUD against /api/tools/<endpoint>/.
 * Uses multipart automatically when a File/Blob is present (photo/image/file).
 */

import api from './client';

const hasFile = (data) =>
  Object.values(data).some((v) => v instanceof File || v instanceof Blob);

const toFormData = (data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    fd.append(k, v);
  });
  return fd;
};

// Let the browser set the multipart boundary by clearing the default JSON header.
const multipartConfig = { headers: { 'Content-Type': undefined } };

export const toolsAdminApi = {
  // 200 only for Django-staff users; used to gate the dashboard.
  adminCheck: () => api.get('/tools/admin-check/').then((r) => r.data),

  list: (endpoint, params = {}) =>
    api.get(`/tools/${endpoint}/`, { params }).then((r) => r.data),

  create: (endpoint, data) => {
    if (hasFile(data)) {
      return api.post(`/tools/${endpoint}/`, toFormData(data), multipartConfig).then((r) => r.data);
    }
    return api.post(`/tools/${endpoint}/`, data).then((r) => r.data);
  },

  // PATCH so unchanged files/required fields need not be resent.
  update: (endpoint, id, data) => {
    if (hasFile(data)) {
      return api.patch(`/tools/${endpoint}/${id}/`, toFormData(data), multipartConfig).then((r) => r.data);
    }
    return api.patch(`/tools/${endpoint}/${id}/`, data).then((r) => r.data);
  },

  remove: (endpoint, id) => api.delete(`/tools/${endpoint}/${id}/`),
};

export default toolsAdminApi;
