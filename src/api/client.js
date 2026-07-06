/**
 * Axios API client with interceptors for JWT authentication.
 * Handles token refresh and request/response transformation.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');

export const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  if (access) {
    localStorage.setItem('accessToken', access);
  } else {
    localStorage.removeItem('accessToken');
  }
  if (refresh) {
    localStorage.setItem('refreshToken', refresh);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Request interceptor - add auth header
api.interceptors.request.use(
  (config) => {
    // Read the latest token (may have been updated by a concurrent refresh)
    const currentToken = accessToken || localStorage.getItem('accessToken');
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Token refresh machinery ---
// Prevents multiple concurrent refresh attempts when several 401s arrive at once
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshComplete(newAccessToken) {
  refreshSubscribers.forEach((cb) => cb(newAccessToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Auth endpoints: a 401 = bad credentials, not an expired session. Let it
    // reach the caller (login/register form) instead of running the
    // refresh/forceLogout machinery, which hard-redirects and reloads the whole
    // app — wiping the error before the user can see it.
    const reqUrl = originalRequest?.url || '';
    if (/\/auth\/(login|register|refresh)\/?$/.test(reqUrl) || /\/firms\/register\/?$/.test(reqUrl)) {
      return Promise.reject(error);
    }

    // If this request has already been retried, don't retry again
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // No refresh token available — force logout via Zustand store
    if (!refreshToken) {
      // Dynamically import to avoid circular deps; use forceLogout (no API call)
      const { useAuthStore } = await import('../stores/authStore');
      useAuthStore.getState().forceLogout();
      // No hard redirect: forceLogout flips isAuthenticated, and ProtectedRoute
      // reactively renders <Navigate to="/login" />. Avoids a full page reload.
      return Promise.reject(error);
    }

    // If already refreshing, queue this request and wait for the new token
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((newToken) => {
          if (newToken) {
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    // Start the refresh process
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
        refresh: refreshToken,
      });

      const { access, refresh: newRefresh } = response.data;

      // Save BOTH the new access token AND the new (rotated) refresh token
      setTokens(access, newRefresh || refreshToken);

      // Notify all queued requests
      onRefreshComplete(access);

      // Retry the original request with the new token
      originalRequest.headers.Authorization = `Bearer ${access}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed — clear everything and redirect to login
      onRefreshComplete(null);

      const { useAuthStore } = await import('../stores/authStore');
      useAuthStore.getState().forceLogout();
      // No hard redirect — ProtectedRoute reacts to the logged-out state and
      // renders <Navigate to="/login" />, so no full page reload.
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
