import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Protected Route with Smart Redirects
 *
 * Automatically redirects users based on their state:
 * 1. Not authenticated → /auth/login
 * 2. Not verified → /auth/verify-email
 * 3. Worker with incomplete profile → /onboarding/worker
 * 4. Wrong role for route → Appropriate dashboard
 */
const ProtectedRoute = ({ children, requireRole = null, requireVerified = true, requireCompleteProfile = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 via-white to-warm-50">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-ocean-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-700 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // 1. Not authenticated → Redirect to login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Email not verified (and verification required)
  if (requireVerified && !user.email_verified) {
    // Allow access to verify-email page itself
    if (!location.pathname.includes('/auth/verify-email')) {
      return <Navigate to="/auth/verify-email" replace />;
    }
  }

  // 3. Worker with incomplete profile
  if (user.role === 'worker' && requireCompleteProfile) {
    const profileComplete = user.profile_completion_percentage >= 100 || user.profile_complete;

    if (!profileComplete && !location.pathname.includes('/onboarding/worker')) {
      // Redirect to onboarding
      return <Navigate to="/onboarding/worker" replace />;
    }
  }

  // 4. Role-based access control
  if (requireRole && user.role !== requireRole) {
    // Redirect to appropriate dashboard based on actual role
    const dashboardPath = user.role === 'worker' ? '/dashboard/worker' : '/dashboard/care-home';
    return <Navigate to={dashboardPath} replace />;
  }

  // All checks passed - render protected content
  return children;
};

export default ProtectedRoute;
