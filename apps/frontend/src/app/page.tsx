'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { fetchDashboardMetrics } from '@/lib/features/dashboard/dashboardSlice';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import SentimentChart from '@/components/dashboard/SentimentChart';
import CustomerStatusChart from '@/components/dashboard/CustomerStatusChart';
import RecentInteractions from '@/components/dashboard/RecentInteractions';
import { Alert } from '@e2m/ui';
import { Users, MessageSquare, TrendingUp, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { metrics, error } = useAppSelector((state) => state.dashboard);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
  }, [dispatch]);

  const totalCustomers = metrics?.total_customers || 0;
  const totalInteractions = metrics?.total_interactions || 0;
  const activeCustomers = metrics?.customers_by_status?.active || 0;
  const positiveSentiment = metrics?.sentiment_distribution?.positive || 0;
  const totalSentiment =
    (metrics?.sentiment_distribution?.positive || 0) +
    (metrics?.sentiment_distribution?.neutral || 0) +
    (metrics?.sentiment_distribution?.negative || 0);

  const satisfactionRate =
    totalSentiment > 0 ? `${Math.round((positiveSentiment / totalSentiment) * 100)}%` : 'N/A';

  return (
    <DashboardLayout title="Overview & Insights">
      {/* Top Banner */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back, {user?.full_name?.split(' ')[0] || 'User'} 👋
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Real-time customer engagement health and AI-powered meeting takeaways
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert
            message="Data Refresh Notice"
            description={error}
            type="warning"
            showIcon
            className="rounded-xl"
          />
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          title="Total Customers"
          value={totalCustomers}
          subtitle={`${activeCustomers} currently active accounts`}
          icon={Users}
          colorScheme="indigo"
        />
        <MetricCard
          title="Interactions Logged"
          value={totalInteractions}
          subtitle="Calls, meetings, and emails recorded"
          icon={MessageSquare}
          colorScheme="blue"
        />
        <MetricCard
          title="Active Account Ratio"
          value={totalCustomers > 0 ? `${Math.round((activeCustomers / totalCustomers) * 100)}%` : '0%'}
          subtitle="Healthy operational engagement"
          icon={TrendingUp}
          colorScheme="emerald"
        />
        <MetricCard
          title="Positive Sentiment Rate"
          value={satisfactionRate}
          subtitle="Extracted via Google Gemini AI"
          icon={Sparkles}
          colorScheme="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SentimentChart distribution={metrics?.sentiment_distribution || {}} />
        <CustomerStatusChart statusCounts={metrics?.customers_by_status || {}} />
      </div>

      {/* Recent Interactions List */}
      <RecentInteractions interactions={metrics?.recent_interactions || []} />
    </DashboardLayout>
  );
}
