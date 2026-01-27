import React from 'react';
import Navbar from './components/layout/Navbar/Navbar';
import './index.css';

/**
 * Main App Component
 * Testing components one by one
 */
function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div style={{ padding: '50px' }}>
        <h1>Testing: Navbar loaded successfully</h1>
      </div>
    </div>
  );
}

export default App;
