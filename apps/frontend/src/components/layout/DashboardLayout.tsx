'use client';

import React from 'react';
import { useAppSelector } from '@/lib/store';
import Sidebar from './Sidebar';
import Header from './Header';
import AuthGuard from '@/components/guards/AuthGuard';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'pl-64' : 'pl-20'
          }`}
        >
          <Header title={title} />
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
