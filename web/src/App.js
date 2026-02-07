import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import OnboardingErrorBoundary from './components/onboarding/OnboardingErrorBoundary';

// Pages
import LandingPage from './pages/landing/LandingPage';
import WorkerRegistration from './pages/auth/WorkerRegistration';
import CareHomeRegistration from './pages/auth/CareHomeRegistration';
import Login from './pages/auth/Login';
import EmailVerification from './pages/auth/EmailVerification';
import WorkerOnboarding from './pages/onboarding/WorkerOnboarding';

import './index.css';

/**
 * Main App Component with Smart Routing
 *
 * Routes organized by functionality:
 * - Public: Landing page
 * - Auth: Login, registration, verification
 * - Onboarding: Worker profile completion
 * - Dashboards: Worker and care home dashboards
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Authentication Routes (under /auth/*) */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<WorkerRegistration />} />
            <Route path="/auth/register/care-home" element={<CareHomeRegistration />} />
            <Route path="/auth/verify-email" element={<EmailVerification />} />

            {/* Legacy auth routes (redirect for backwards compatibility) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<WorkerRegistration />} />
            <Route path="/verify-email" element={<EmailVerification />} />

            {/* Onboarding Routes */}
            <Route
              path="/onboarding/worker"
              element={
                <ProtectedRoute requireRole="worker" requireVerified={true}>
                  <OnboardingErrorBoundary>
                    <WorkerOnboarding />
                  </OnboardingErrorBoundary>
                </ProtectedRoute>
              }
            />

            {/* Legacy onboarding route */}
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute requireRole="worker" requireVerified={true}>
                  <OnboardingErrorBoundary>
                    <WorkerOnboarding />
                  </OnboardingErrorBoundary>
                </ProtectedRoute>
              }
            />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard/worker"
              element={
                <ProtectedRoute requireRole="worker" requireCompleteProfile={true}>
                  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 via-white to-warm-50">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-charcoal-900 mb-4">Worker Dashboard</h1>
                      <p className="text-gray-600">Coming soon! Your profile is complete.</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/care-home"
              element={
                <ProtectedRoute requireRole="care_home_admin">
                  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-50 via-white to-sage-50">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-charcoal-900 mb-4">Care Home Dashboard</h1>
                      <p className="text-gray-600">Coming soon!</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Fallback - 404 redirects to landing */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
