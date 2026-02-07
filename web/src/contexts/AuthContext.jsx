import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../services/api';

/**
 * Authentication Context with HTTP-only Cookie Support
 *
 * Features:
 * - Cookie-based authentication (no localStorage tokens)
 * - Automatic auth state checking on mount
 * - Smart redirects based on user state
 * - Cross-tab logout synchronization
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth state on mount (via /auth/me endpoint)
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get user from backend (cookies sent automatically)
        const userData = await authApi.getCurrentUser();

        // Map backend response to our user state
        const mappedUser = {
          ...userData,
          role: userData.role || userData.user_type, // Handle both field names
        };

        setUser(mappedUser);
      } catch (err) {
        // Not authenticated or token expired
        console.log('No active session');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Listen for logout events from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      // If logout event from another tab
      if (e.key === 'logout-event') {
        setUser(null);
        window.location.href = '/auth/login';
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Register a new user
   */
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authApi.register(userData);

      // Registration successful - backend returns user_id, email, message
      // No cookies set yet - user needs to verify email first
      return { success: true, message: response.message || 'Registration successful' };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with email and password
   * Backend sets HTTP-only cookies automatically
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      // Login - backend sets HTTP-only cookies
      await authApi.login(email, password);

      // Fetch complete user profile
      const fullUser = await authApi.getCurrentUser();
      const userData = {
        ...fullUser,
        role: fullUser.role || fullUser.user_type,
      };

      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user - clears cookies on backend
   */
  const logout = async () => {
    try {
      // Call backend to clear HTTP-only cookies
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state
      setUser(null);

      // Notify other tabs of logout (cross-tab sync)
      localStorage.setItem('logout-event', Date.now().toString());
      localStorage.removeItem('logout-event');
    }
  };

  /**
   * Verify email with token
   */
  const verifyEmail = async (token) => {
    try {
      setError(null);
      const response = await authApi.verifyEmail(token);

      // Update local user state
      if (user) {
        setUser({ ...user, email_verified: true });
      }

      return { success: true, message: response.message };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Resend verification email
   */
  const resendVerificationEmail = async (email) => {
    try {
      setError(null);
      const response = await authApi.resendVerificationEmail(email);
      return { success: true, message: response.message || 'Verification email sent' };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to send verification email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Refresh user data (useful after profile updates)
   */
  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      const mappedUser = {
        ...userData,
        role: userData.role || userData.user_type,
      };
      setUser(mappedUser);
      return mappedUser;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      return null;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    verifyEmail,
    resendVerificationEmail,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
