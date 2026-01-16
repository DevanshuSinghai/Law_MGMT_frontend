/**
 * UI store for app-wide UI state.
 */

import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Sidebar state
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Loading state
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  // Mobile detection
  isMobile: window.innerWidth < 768,
  setIsMobile: (isMobile) => set({ isMobile }),
}));

export default useUIStore;
