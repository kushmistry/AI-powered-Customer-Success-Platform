'use client';

import React from 'react';
import { UserCheck, Clock, UserX } from 'lucide-react';

interface CustomerStatusChartProps {
  statusCounts: Record<string, number>;
}

export default function CustomerStatusChart({ statusCounts = {} }: CustomerStatusChartProps) {
  const active = statusCounts.active || 0;
  const inactive = statusCounts.inactive || 0;
  const churned = statusCounts.churned || 0;
  const total = active + inactive + churned;

  const categories = [
    {
      label: 'Active Customers',
      count: active,
      pct: total > 0 ? Math.round((active / total) * 100) : 0,
      icon: UserCheck,
      color: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
    },
    {
      label: 'Inactive / Dormant',
      count: inactive,
      pct: total > 0 ? Math.round((inactive / total) * 100) : 0,
      icon: Clock,
      color: 'bg-slate-400',
      badgeBg: 'bg-slate-50',
      badgeText: 'text-slate-700',
    },
    {
      label: 'Churned',
      count: churned,
      pct: total > 0 ? Math.round((churned / total) * 100) : 0,
      icon: UserX,
      color: 'bg-rose-500',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Account Health</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer lifecycle breakdown by status
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {total} Total
        </span>
      </div>

      <div className="space-y-4 my-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <span>{cat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{cat.count}</span>
                  <span className="text-slate-400">({cat.pct}%)</span>
                </div>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${cat.pct}%` }}
                  className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

