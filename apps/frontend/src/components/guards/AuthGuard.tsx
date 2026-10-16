'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard for protected pages.
 * Shows a loading spinner while auth state is resolving, then either
 * renders children (authenticated) or redirects to /login (unauthenticated).
 * Prevents the "dashboard blink" before redirect.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, token, profileLoading } = useAppSelector((state) => state.auth);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if there's a token in localStorage (SSR-safe)
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!storedToken && !token) {
      // No token at all — redirect immediately
      router.replace('/login');
      return;
    }

    // Token exists — wait for profile to resolve in ReduxProvider's AuthInitializer
    // Once profileLoading finishes, we can determine final auth state
    if (!profileLoading) {
      if (!isAuthenticated) {
        // Token was invalid or expired (getProfile rejected)
        router.replace('/login');
      } else {
        // Authenticated — allow render
        setChecking(false);
      }
    }
  }, [isAuthenticated, token, profileLoading, router]);

  // While checking auth or if unauthenticated, show spinner (no blink)
  if (checking || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
