"use client";

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    setEnvVars({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Debug</h1>
      <pre>{JSON.stringify(envVars, null, 2)}</pre>
      
      <h2>Test API Connection</h2>
      <button 
        onClick={async () => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
            const data = await response.json();
            alert(`API Response: ${JSON.stringify(data)}`);
          } catch (error) {
            alert(`API Error: ${error}`);
          }
        }}
      >
        Test Backend Connection
      </button>

      <h2>Test Admin Login</h2>
      <button 
        onClick={async () => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: 'admin@quickbird.com',
                password: 'admin123'
              })
            });
            const data = await response.json();
            alert(`Login Response: ${JSON.stringify(data)}`);
          } catch (error) {
            alert(`Login Error: ${error}`);
          }
        }}
      >
        Test Admin Login
      </button>

      <h2>Test Registration</h2>
      <button 
        onClick={async () => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: 'test@example.com',
                password: 'Test123456',
                username: 'testuser',
                full_name: 'Test User'
              })
            });
            const data = await response.json();
            alert(`Registration Response: ${JSON.stringify(data)}`);
          } catch (error) {
            alert(`Registration Error: ${error}`);
          }
        }}
      >
        Test Registration
      </button>
    </div>
  );
}
