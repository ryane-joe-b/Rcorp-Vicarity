import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/landing/LandingPage';
import './index.css';

/**
 * Main App Component
 * Wrapped in error boundary to catch crashes
 */
function App() {
  return (
    <ErrorBoundary>
      <LandingPage />
    </ErrorBoundary>
  );
}

export default App;
