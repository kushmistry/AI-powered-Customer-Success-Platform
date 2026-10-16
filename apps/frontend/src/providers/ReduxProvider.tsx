'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { getProfile } from '@/lib/features/auth/authSlice';
import { Toaster } from 'react-hot-toast';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // If token exists, load current user session
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      store.dispatch(getProfile());
    }
  }, []);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </AuthInitializer>
    </Provider>
  );
}

