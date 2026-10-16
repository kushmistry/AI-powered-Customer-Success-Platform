'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store';

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard for public-only pages (login, register).
 * If the user is already authenticated, redirects to the dashboard.
 * Prevents showing the login form flash before redirect for logged-in users.
 */
export default function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const { isAuthenticated, token, profileLoading } = useAppSelector((state) => state.auth);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!storedToken && !token) {
      // No token — user is a guest, allow access to login/register
      setChecking(false);
      return;
    }

    // Token exists — wait for profile resolution
    if (!profileLoading) {
      if (isAuthenticated) {
        // Already logged in — redirect to dashboard
        router.replace('/');
      } else {
        // Token was invalid — let them stay on login/register
        setChecking(false);
      }
    }
  }, [isAuthenticated, token, profileLoading, router]);

  if (checking || isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
