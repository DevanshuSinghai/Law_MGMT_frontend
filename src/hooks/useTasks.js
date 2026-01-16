/**
 * React Query hooks for tasks.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api';
import { message } from 'antd';

export const QUERY_KEYS = {
  tasks: 'tasks',
  task: 'task',
  myTasks: 'myTasks',
};

export const useTasks = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.tasks, params],
    queryFn: () => tasksApi.list(params),
    staleTime: 30000,
  });
};

export const useMyTasks = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.myTasks, params],
    queryFn: () => tasksApi.myTasks(params),
    staleTime: 30000,
  });
};

export const useTask = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.task, id],
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tasks] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.myTasks] });
      message.success('Task created successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to create task');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => tasksApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tasks] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.myTasks] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.task, id] });
      message.success('Task updated successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to update task');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tasks] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.myTasks] });
      message.success('Task deleted successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to delete task');
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: tasksApi.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tasks] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.myTasks] });
      message.success('Task completed!');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to complete task');
    },
  });
};
