"use client";

import React, { useState } from 'react';
import axios from 'axios';

const ConnectionTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      console.log('Testing connection to http://localhost:5000/api/test');
      const response = await axios.get('http://localhost:5000/api/test');
      console.log('Response received:', response);
      setTestResult(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Connection test failed:', err);
      setError(`Failed to connect to backend: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="connection-test" style={{ padding: '20px', margin: '20px', backgroundColor: '#f0f4f9', borderRadius: '8px' }}>
      <h2>Backend Connection Test</h2>
      <button 
        onClick={testConnection}
        style={{ 
          padding: '10px 15px', 
          backgroundColor: '#2a59a8', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer',
          marginBottom: '15px'
        }}
      >
        Test Connection
      </button>
      
      {loading ? (
        <p>Testing connection...</p>
      ) : error ? (
        <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffeeee', borderRadius: '4px' }}>
          <p>{error}</p>
        </div>
      ) : testResult ? (
        <div style={{ color: 'green', padding: '10px', backgroundColor: '#eeffee', borderRadius: '4px' }}>
          <p>Successfully connected to backend!</p>
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      ) : (
        <p>Click the button to test the connection</p>
      )}
    </div>
  );
};

export default ConnectionTest;