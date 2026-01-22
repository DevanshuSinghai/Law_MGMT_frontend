/**
 * Authentication API endpoints
 */

import api, { setTokens, clearTokens } from './client';

export const authApi = {
  // Login with email and password
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    const { access, refresh, user } = response.data;
    setTokens(access, refresh);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  // Register new user (individual)
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    const { tokens, user } = response.data;
    if (tokens) {
      setTokens(tokens.access, tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // Register firm (manager self-registration)
  registerFirm: async (firmData) => {
    const response = await api.post('/firms/register/', firmData);
    const { tokens, user, firm } = response.data;
    if (tokens) {
      setTokens(tokens.access, tokens.refresh);
      user.firm = {
        id: firm.id,
        name: firm.name,
        role: 'firm_manager',
        can_assign_tasks: true,
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      clearTokens();
    }
  },

  // Get current user profile
  getMe: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/auth/me/', data);
    return response.data;
  },

  // Change password (for logged-in users)
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPassword,
    });
    return response.data;
  },

  // Request password reset (forgot password)
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/password-reset/', { email });
    alert(response.data.message);
    return response.data;
  },

  // Confirm password reset with token
  confirmPasswordReset: async (token, newPassword) => {
    const response = await api.post('/auth/password-reset/confirm/', {
      token,
      new_password: newPassword,
      new_password_confirm: newPassword,
    });
    return response.data;
  },
};

export default authApi;

