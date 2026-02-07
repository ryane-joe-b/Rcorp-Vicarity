import axios from 'axios';

/**
 * API service with HTTP-only cookie-based authentication.
 *
 * Security features:
 * - Tokens stored in HTTP-only cookies (not localStorage)
 * - Automatic token refresh on 401 errors
 * - CSRF protection via SameSite cookies
 * - Credentials sent automatically by browser
 */

// API base URL - from environment or default to /api
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with cookie support
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds (increased from 10s for slow endpoints)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRITICAL: Send cookies with every request
});

// Track ongoing refresh request to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshSubscribers = [];

// Add subscribers waiting for token refresh
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers when token is refreshed
const onTokenRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't try to refresh on auth endpoints (would cause infinite loop)
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Try to refresh the token
          await api.post('/auth/refresh');

          // Token refreshed successfully
          isRefreshing = false;
          onTokenRefreshed();

          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - user needs to login again
          isRefreshing = false;
          refreshSubscribers = [];

          console.warn('Token refresh failed - redirecting to login');
          // Clear any auth state and redirect to login
          window.location.href = '/auth/login';

          return Promise.reject(refreshError);
        }
      }

      // Wait for the ongoing refresh to complete
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(api(originalRequest));
        });
      });
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
   * Get all active qualifications with worker counts
   * Used for landing page qualifications showcase
   */
  getQualifications: async () => {
    try {
      const response = await api.get('/public/qualifications');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch qualifications:', error);
      // Return empty data if API fails
      return {
        qualifications: [],
        total_count: 0,
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
  /**
   * Login user - sets HTTP-only auth cookies.
   * Tokens are NOT returned in response (they're in cookies).
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register a new user.
   * No cookies are set on registration - user must verify email first.
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Verify email address with token.
   */
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  /**
   * Get current user info (requires auth cookie).
   * Used to check auth state and get user details for smart routing.
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (email) => {
    const response = await api.post(`/auth/resend-verification?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  /**
   * Logout - clears HTTP-only auth cookies on server.
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    }
  },

  /**
   * Manually refresh tokens (usually automatic via interceptor).
   */
  refresh: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

// Worker API endpoints
export const workerApi = {
  getProfile: async () => {
    const response = await api.get('/worker/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/worker/profile', profileData);
    return response.data;
  },
};

export default api;
