import React from 'react';
import LandingPage from './pages/landing/LandingPage';
import './index.css';

/**
 * Main App Component
 * Currently shows landing page
 * TODO: Add routing when auth pages are built
 */
function App() {
  console.log('Vicarity App Loading - Build:', process.env.NODE_ENV);
  return <LandingPage />;
}

export default App;
