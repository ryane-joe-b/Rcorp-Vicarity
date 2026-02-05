import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Protected Route Component
 *
 * Restricts access to routes based on authentication status and user role.
 * Redirects to appropriate pages based on user state.
 */
const ProtectedRoute = ({ children, requireRole = null }) => {
  const { user, loading } = useAuth();

  // Show nothing while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-sage-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirement
  if (requireRole && user.role !== requireRole) {
    // Redirect to appropriate dashboard based on actual role
    const dashboardPath = user.role === 'worker' ? '/dashboard/worker' : '/dashboard/care-home';
    return <Navigate to={dashboardPath} replace />;
  }

  // Authenticated and authorized - render children
  return children;
};

export default ProtectedRoute;
