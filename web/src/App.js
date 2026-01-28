import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import LandingPage from './pages/landing/LandingPage';
import WorkerRegistration from './pages/auth/WorkerRegistration';
import CareHomeRegistration from './pages/auth/CareHomeRegistration';
import Login from './pages/auth/Login';
import EmailVerification from './pages/auth/EmailVerification';

import './index.css';

/**
 * Main App Component
 * Wrapped in error boundary to catch crashes
 * Uses React Router for navigation
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Authentication Routes */}
            <Route path="/register" element={<WorkerRegistration />} />
            <Route path="/register/care-home" element={<CareHomeRegistration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<EmailVerification />} />

            {/* Fallback - 404 */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
