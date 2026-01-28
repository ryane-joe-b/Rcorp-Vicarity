import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../services/api';

/**
 * Authentication Context
 * Manages user state, tokens, and auth operations
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Register a new user
   */
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authApi.register(userData);

      // Store tokens
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }

      setUser(response.user);
      return { success: true, user: response.user };
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
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authApi.login(email, password);

      // Store tokens
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }

      setUser(response.user);
      return { success: true, user: response.user };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  /**
   * Verify email with token
   */
  const verifyEmail = async (token) => {
    try {
      setError(null);
      const response = await authApi.verifyEmail(token);
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

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    verifyEmail,
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
