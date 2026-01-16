/**
 * React Query hooks for dashboard.
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';

export const QUERY_KEYS = {
  dashboardStats: 'dashboardStats',
  dashboardDeadlines: 'dashboardDeadlines',
  dashboardActivity: 'dashboardActivity',
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.dashboardStats],
    queryFn: dashboardApi.getStats,
    staleTime: 60000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useDashboardDeadlines = (days = 7) => {
  return useQuery({
    queryKey: [QUERY_KEYS.dashboardDeadlines, days],
    queryFn: () => dashboardApi.getDeadlines(days),
    staleTime: 60000,
  });
};

export const useDashboardActivity = (limit = 20) => {
  return useQuery({
    queryKey: [QUERY_KEYS.dashboardActivity, limit],
    queryFn: () => dashboardApi.getActivity(limit),
    staleTime: 30000,
  });
};
