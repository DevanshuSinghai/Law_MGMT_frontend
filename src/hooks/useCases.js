/**
 * React Query hooks for data fetching with caching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { casesApi, caseTypesApi } from '../api';
import { message } from 'antd';

// Query keys
export const QUERY_KEYS = {
  cases: 'cases',
  case: 'case',
  caseTypes: 'caseTypes',
  caseAssignments: 'caseAssignments',
  caseNotes: 'caseNotes',
};

// Cases hooks
export const useCases = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.cases, params],
    queryFn: () => casesApi.list(params),
    staleTime: 30000, // 30 seconds
  });
};

export const useCase = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.case, id],
    queryFn: () => casesApi.get(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

export const useCreateCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: casesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.cases] });
      message.success('Case created successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to create case');
    },
  });
};

export const useUpdateCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => casesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.cases] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.case, id] });
      message.success('Case updated successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to update case');
    },
  });
};

export const useDeleteCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: casesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.cases] });
      message.success('Case deleted successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to delete case');
    },
  });
};

// Case Types
export const useCaseTypes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.caseTypes],
    queryFn: caseTypesApi.list,
    staleTime: 5 * 60 * 1000, // 5 minutes - case types don't change often
  });
};

// Case Assignments
export const useCaseAssignments = (caseId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.caseAssignments, caseId],
    queryFn: () => casesApi.getAssignments(caseId),
    enabled: !!caseId,
  });
};

export const useAddCaseAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ caseId, data }) => casesApi.addAssignment(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.caseAssignments, caseId] });
      message.success('Assignment added');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to add assignment');
    },
  });
};

// Case Notes
export const useCaseNotes = (caseId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.caseNotes, caseId],
    queryFn: () => casesApi.getNotes(caseId),
    enabled: !!caseId,
  });
};

export const useAddCaseNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ caseId, data }) => casesApi.addNote(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.caseNotes, caseId] });
      message.success('Note added');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to add note');
    },
  });
};
