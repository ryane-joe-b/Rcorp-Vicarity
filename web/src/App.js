import React from 'react';
import './index.css';

/**
 * Main App Component
 * Testing minimal render
 */
function App() {
  console.log('Vicarity App Loading - Build:', process.env.NODE_ENV);
  
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1>Vicarity - Testing</h1>
      <p>If you see this, React is working.</p>
      <p>Build time: {new Date().toISOString()}</p>
    </div>
  );
}

export default App;
