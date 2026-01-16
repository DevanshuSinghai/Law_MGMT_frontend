/**
 * React Query hooks for documents.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api';
import { message } from 'antd';

export const QUERY_KEYS = {
  documents: 'documents',
  document: 'document',
  documentVersions: 'documentVersions',
};

export const useDocuments = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.documents, params],
    queryFn: () => documentsApi.list(params),
    staleTime: 30000,
  });
};

export const useDocument = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.document, id],
    queryFn: () => documentsApi.get(id),
    enabled: !!id,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ caseId, file, title, category, description, tags }) =>
      documentsApi.upload(caseId, file, title, category, description, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.documents] });
      message.success('Document uploaded successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to upload document');
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.documents] });
      message.success('Document deleted successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to delete document');
    },
  });
};

export const useDocumentVersions = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.documentVersions, id],
    queryFn: () => documentsApi.getVersions(id),
    enabled: !!id,
  });
};

export const useUploadVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, file, changeNotes }) =>
      documentsApi.uploadVersion(id, file, changeNotes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.documents] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.document, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.documentVersions, id] });
      message.success('New version uploaded successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to upload version');
    },
  });
};

// Helper to trigger download
export const downloadDocument = async (id, fileName) => {
  try {
    const blob = await documentsApi.download(id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'document';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    message.error('Failed to download document');
  }
};
