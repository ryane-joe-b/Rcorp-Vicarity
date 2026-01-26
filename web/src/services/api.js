import axios from 'axios';

// API base URL - from environment or default to /api
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - could trigger refresh here
      console.warn('Authentication required');
    }
    return Promise.reject(error);
  }
);

// Public API endpoints (no auth required)
export const publicApi = {
  /**
   * Get public statistics for landing page
   * Returns real-time counts from database
   */
  getStats: async () => {
    try {
      const response = await api.get('/public/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch public stats:', error);
      // Return fallback data if API fails
      return {
        total_workers: 0,
        total_care_homes: 0,
        completed_profiles: 0,
        verified_care_homes: 0,
        display: {
          workers: '0+',
          care_homes: '0+',
          completed: '0',
          verified: '0',
        },
      };
    }
  },

  /**
   * Check public API health
   */
  healthCheck: async () => {
    const response = await api.get('/public/health');
    return response.data;
  },
};

// Auth API endpoints
export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default api;
