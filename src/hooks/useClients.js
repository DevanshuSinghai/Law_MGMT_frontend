/**
 * React Query hooks for clients.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../api';
import { message } from 'antd';

export const QUERY_KEYS = {
  clients: 'clients',
  client: 'client',
};

export const useClients = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.clients, params],
    queryFn: () => clientsApi.list(params),
    staleTime: 30000,
  });
};

export const useClient = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.client, id],
    queryFn: () => clientsApi.get(id),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.clients] });
      message.success('Client created successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to create client');
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => clientsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.clients] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.client, id] });
      message.success('Client updated successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to update client');
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.clients] });
      message.success('Client deleted successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to delete client');
    },
  });
};
