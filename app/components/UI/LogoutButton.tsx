'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'icon' | 'text';
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ variant = 'text', className = '', children }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`p-2 text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-2 ${className}`}
        title="Logout"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition flex items-center gap-2 ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      {children || 'Logout'}
    </button>
  );
}
