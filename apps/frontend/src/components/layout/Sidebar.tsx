'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store';
import { toggleSidebar } from '@/lib/features/ui/uiSlice';
import { logout } from '@/lib/features/auth/authSlice';
import ProfileModal from '@/components/profile/ProfileModal';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  Edit2,
  Layers,
  LogOut,
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: Users,
      active: pathname.startsWith('/customers'),
    },
    {
      name: 'Interactions & AI',
      href: '/interactions',
      icon: MessageSquare,
      active: pathname.startsWith('/interactions'),
    },
    ...(user?.role === 'admin'
      ? [
          {
            name: 'Team & Roles',
            href: '/users',
            icon: ShieldCheck,
            active: pathname.startsWith('/users'),
          },
        ]
      : []),
  ];


  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      {sidebarOpen ? (
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 tracking-tight text-base leading-none">
                E2M Insights
              </span>
              <span className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
                Customer Success
              </span>
            </div>
          </Link>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative flex h-16 items-center justify-center border-b border-slate-100">
          <Link href="/" className="flex items-center justify-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-100">
              <Sparkles className="h-5 w-5" />
            </div>
          </Link>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="absolute -right-3 top-5 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={!sidebarOpen ? item.name : undefined}
              className={`flex items-center rounded-xl text-sm font-medium transition-all ${
                sidebarOpen ? 'gap-3 px-3.5 py-2.5' : 'justify-center p-2.5'
              } ${
                item.active
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  item.active ? 'text-indigo-600' : 'text-slate-400'
                }`}
              />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Red Logout Footer */}
      {user && (
        <div className="border-t border-slate-100 p-3 space-y-2">
          {/* Logged in User Details (Click to edit profile) */}
          <div
            onClick={() => setProfileOpen(true)}
            className={`flex items-center rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 cursor-pointer transition-all group ${
              sidebarOpen ? 'gap-3 p-2.5' : 'justify-center p-2'
            }`}
            title="Click to edit your profile"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-semibold text-sm group-hover:bg-indigo-200 transition-colors">
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium text-slate-900 group-hover:text-indigo-900">
                    {user.full_name}
                  </span>
                  <Edit2 className="h-3 w-3 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield className="h-3 w-3 text-indigo-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                    {user.role}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Logout Button in Red Color below User Details */}
          <button
            onClick={handleLogout}
            className={`flex items-center w-full rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200/60 shadow-xs transition-all ${
              sidebarOpen ? 'gap-3 px-3.5 py-2.5' : 'justify-center p-2.5'
            }`}
            title="Log out of account"
          >
            <LogOut className="h-4 w-4 shrink-0 text-red-600" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      )}

      {/* Profile Edit Modal */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </aside>
  );
}

