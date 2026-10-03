'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function DevLoginContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'ADMIN';
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [status, setStatus] = useState('Logging in...');

  useEffect(() => {
    async function doLogin() {
      try {
        const credentials = role === 'ADMIN' 
          ? { email: 'adminRecycleHub@gmail.com', password: 'admin123' }
          : { email: 'user@recyclehub.com', password: 'user123' };

        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        if (res.ok) {
          setStatus('Login OK! Redirecting to ' + redirect);
          setTimeout(() => {
            window.location.href = redirect;
          }, 300);
        } else {
          setStatus('Login failed');
        }
      } catch (err) {
        setStatus('Error: ' + String(err));
      }
    }

    doLogin();
  }, [role, redirect]);

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h2>Dev Auto Login for Screenshots</h2>
      <p>{status}</p>
    </div>
  );
}

export default function DevLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DevLoginContent />
    </Suspense>
  );
}
