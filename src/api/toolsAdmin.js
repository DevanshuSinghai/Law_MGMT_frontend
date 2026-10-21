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

const csrfToken = () => document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)?.[1];

// The dashboard is reached via the Django admin login, so send its session
// cookie — and the CSRF token Django requires for session-authenticated writes.
const adminConfig = (multipart = false) => ({
  withCredentials: true,
  headers: {
    'X-CSRFToken': csrfToken(),
    // Let the browser set the multipart boundary by clearing the default JSON header.
    ...(multipart && { 'Content-Type': undefined }),
  },
});

export const toolsAdminApi = {
  // 200 only for Django-staff users. Sends cookies so the Django admin session
  // (from /admin/) counts as access, in addition to a staff JWT.
  adminCheck: () => api.get('/tools/admin-check/', { withCredentials: true }).then((r) => r.data),

  // Credentials here too, so staff also see inactive records (public sees active only).
  list: (endpoint, params = {}) =>
    api.get(`/tools/${endpoint}/`, { params, withCredentials: true }).then((r) => r.data),

  create: (endpoint, data) => {
    if (hasFile(data)) {
      return api.post(`/tools/${endpoint}/`, toFormData(data), adminConfig(true)).then((r) => r.data);
    }
    return api.post(`/tools/${endpoint}/`, data, adminConfig()).then((r) => r.data);
  },

  // PATCH so unchanged files/required fields need not be resent.
  update: (endpoint, id, data) => {
    if (hasFile(data)) {
      return api.patch(`/tools/${endpoint}/${id}/`, toFormData(data), adminConfig(true)).then((r) => r.data);
    }
    return api.patch(`/tools/${endpoint}/${id}/`, data, adminConfig()).then((r) => r.data);
  },

  remove: (endpoint, id) => api.delete(`/tools/${endpoint}/${id}/`, adminConfig()),
};

export default toolsAdminApi;
