import React, { useState, useEffect } from 'react';

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setHealth(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <h1>Vicarity</h1>
      <p>Care Worker Marketplace</p>
      
      <div style={{
        background: '#f5f5f5',
        padding: '1rem',
        borderRadius: '8px',
        marginTop: '2rem'
      }}>
        <h2>System Status</h2>
        {loading ? (
          <p>Checking API connection...</p>
        ) : health ? (
          <p style={{ color: 'green' }}>
            API Connected: {health.message}
          </p>
        ) : (
          <p style={{ color: 'orange' }}>
            API not reachable (this is normal during development)
          </p>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Next Steps</h2>
        <ul>
          <li>Replace this with your actual React application</li>
          <li>Add authentication flows</li>
          <li>Build your care worker marketplace features</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
