/**
 * API client for the Law Converter micro-tool.
 * This is a standalone client WITHOUT auth interceptors,
 * since the tool's API is public (AllowAny).
 * Works for both web and mobile/iOS apps.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const lawConverterApi = axios.create({
  baseURL: `${API_BASE_URL}/tools/law-converter`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Fetch paginated law mappings with optional filters.
 * @param {Object} params - Query parameters
 * @param {string} params.law_type - 'ipc_bns' | 'crpc_bnss'
 * @param {string} params.search - Search query
 * @param {string} params.direction - 'old_to_new' | 'new_to_old' | 'both'
 * @param {string} params.status - Filter by mapping status
 * @param {number} params.page - Page number
 * @param {number} params.page_size - Items per page
 */
export const getMappings = async (params = {}) => {
  const response = await lawConverterApi.get('/mappings/', { params });
  return response.data;
};

/**
 * Fetch a single mapping by ID.
 * @param {string} id - UUID of the mapping
 */
export const getMappingDetail = async (id) => {
  const response = await lawConverterApi.get(`/mappings/${id}/`);
  return response.data;
};

/**
 * Fetch aggregate statistics.
 * @param {string} lawType - Optional filter: 'ipc_bns' | 'crpc_bnss'
 */
export const getStats = async (lawType = null) => {
  const params = lawType ? { law_type: lawType } : {};
  const response = await lawConverterApi.get('/stats/', { params });
  return response.data;
};

export default lawConverterApi;
