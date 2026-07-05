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

// Trigger a browser download from a blob
const saveBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'document';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Helper to trigger download of the current file
export const downloadDocument = async (id, fileName) => {
  try {
    const blob = await documentsApi.download(id);
    saveBlob(blob, fileName);
  } catch (error) {
    message.error('Failed to download document');
  }
};

// Helper to trigger download of a specific historical version
export const downloadDocumentVersion = async (id, versionId, fileName) => {
  try {
    const blob = await documentsApi.downloadVersion(id, versionId);
    saveBlob(blob, fileName);
  } catch (error) {
    message.error('Failed to download version');
  }
};

// Open a blob in a browser tab. Callers must pass a window handle opened
// synchronously in the click handler (via window.open('', '_blank')) so the
// popup blocker allows it before the async fetch resolves.
const openBlob = (blob, win) => {
  const url = window.URL.createObjectURL(blob);
  if (win) {
    win.location = url;
  } else {
    win = window.open(url, '_blank');
  }
  // Revoke after the tab has had time to load the resource
  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
};

// View the current file inline (PDF/images render in-browser; other types
// fall back to the browser's default handling / download).
export const viewDocument = async (id, win) => {
  try {
    const blob = await documentsApi.download(id);
    openBlob(blob, win);
  } catch {
    if (win) win.close();
    message.error('Failed to open document');
  }
};

// View a specific historical version inline
export const viewDocumentVersion = async (id, versionId, win) => {
  try {
    const blob = await documentsApi.downloadVersion(id, versionId);
    openBlob(blob, win);
  } catch {
    if (win) win.close();
    message.error('Failed to open version');
  }
};
