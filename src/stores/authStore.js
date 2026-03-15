/**
 * Authentication store using Zustand.
 * Handles user state, login/logout, and persistence.
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { authApi } from '../api';
import { clearTokens as clearApiTokens } from '../api/client';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Initialize auth state from localStorage
        initialize: () => {
          const token = localStorage.getItem('accessToken');
          const userStr = localStorage.getItem('user');
          
          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              set({ user, isAuthenticated: true, isLoading: false });
            } catch {
              // Invalid user data — clear everything and mark unauthenticated
              clearApiTokens();
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          } else {
            // No token or no user — ensure we're fully logged out
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        },

        // Login action
        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const data = await authApi.login(email, password);
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return data;
          } catch (error) {
            const message = error.response?.data?.detail || 'Login failed';
            set({ isLoading: false, error: message });
            throw error;
          }
        },

        // Register firm action
        registerFirm: async (firmData) => {
          set({ isLoading: true, error: null });
          try {
            const data = await authApi.registerFirm(firmData);
            const user = {
              ...data.user,
              firm: {
                id: data.firm.id,
                name: data.firm.name,
                role: 'firm_manager',
                can_assign_tasks: true,
              },
            };
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return data;
          } catch (error) {
            const message = error.response?.data?.detail || 
                           Object.values(error.response?.data || {})[0] || 
                           'Registration failed';
            set({ isLoading: false, error: message });
            throw error;
          }
        },

        // Logout action — clears everything including Zustand persist storage
        logout: async () => {
          try {
            await authApi.logout();
          } catch {
            // Ignore logout API errors
          } finally {
            // Clear API tokens (accessToken, refreshToken, user keys)
            clearApiTokens();
            // Clear Zustand persist storage so stale auth isn't restored on reload
            localStorage.removeItem('auth-storage');
            // Reset store state
            set({ ...initialState, isLoading: false });
          }
        },

        // Force logout (called from Axios interceptor without API call)
        forceLogout: () => {
          clearApiTokens();
          localStorage.removeItem('auth-storage');
          set({ ...initialState, isLoading: false });
        },

        // Update user profile
        updateUser: (userData) => {
          const currentUser = get().user;
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
        },

        // Clear error
        clearError: () => set({ error: null }),

        // Check if user has a specific role
        hasRole: (role) => {
          const { user } = get();
          if (!user) return false;
          if (user.is_superuser) return true;
          return user.firm?.role === role;
        },

        // Check if user is firm manager or higher
        isManager: () => {
          const { user } = get();
          if (!user) return false;
          return user.is_superuser || user.firm?.role === 'firm_manager';
        },

        // Check if user can assign tasks (for current context)
        canAssignTasks: () => {
          const { user } = get();
          if (!user) return false;
          if (user.is_superuser) return true;
          if (user.firm?.role === 'firm_manager') return true;
          return user.firm?.can_assign_tasks || false;
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// Initialize on app load
if (typeof window !== 'undefined') {
  // Delay initialization to ensure localStorage is available
  setTimeout(() => {
    useAuthStore.getState().initialize();
  }, 0);
}

export default useAuthStore;
