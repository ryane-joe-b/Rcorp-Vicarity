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
          // Map backend response to our user state
          const mappedUser = {
            ...userData,
            role: userData.role || userData.user_type, // Handle both field names
          };
          setUser(mappedUser);
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
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

      // Registration successful - backend returns user_id, email, message
      // No tokens yet - user needs to verify email first
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

      // Fetch complete user profile with actual completion percentage
      try {
        const fullUser = await authApi.getCurrentUser();
        const userData = {
          ...fullUser,
          role: fullUser.role || fullUser.user_type,
        };
        setUser(userData);
        return { success: true, user: userData };
      } catch (profileErr) {
        // If profile fetch fails, use data from login response
        const userData = {
          id: response.user_id,
          email: email,
          role: response.user_type,
          email_verified: response.email_verified,
          profile_completion_percentage: 0,
        };
        setUser(userData);
        return { success: true, user: userData };
      }
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

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    verifyEmail,
    resendVerificationEmail,
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
