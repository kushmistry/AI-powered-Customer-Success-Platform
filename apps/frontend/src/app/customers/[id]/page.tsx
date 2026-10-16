'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { fetchCustomerById } from '@/lib/features/customers/customerSlice';
import { fetchInteractions } from '@/lib/features/interactions/interactionSlice';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate } from '@/lib/utils';
import { Button, Tag, Spin, Alert, Empty } from '@e2m/ui';
import {
  ArrowLeft,
  Plus,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function CustomerDetailPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const customerId = params.id as string;

  const { detail: customer, detailLoading, error } = useAppSelector((state) => state.customers);
  const { list: interactions, loading: interactionsLoading } = useAppSelector(
    (state) => state.interactions
  );
  const { user } = useAppSelector((state) => state.auth);

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomerById(customerId));
      dispatch(fetchInteractions({ customer_id: customerId, size: 50 }));
    }
  }, [dispatch, customerId]);

  if (detailLoading) {
    return (
      <DashboardLayout title="Customer Details">
        <div className="flex h-64 items-center justify-center">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !customer) {
    return (
      <DashboardLayout title="Customer Not Found">
        <div className="p-6">
          <Alert
            message="Unable to Load Customer"
            description={error || 'Customer does not exist or has been removed.'}
            type="error"
            showIcon
            action={
              <Link href="/customers">
                <Button size="small" type="primary" danger>
                  Return to Directory
                </Button>
              </Link>
            }
            className="rounded-2xl"
          />
        </div>
      </DashboardLayout>
    );
  }

  const getStatusTagColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'churned':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSentimentTagColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <DashboardLayout title={customer.company}>
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to customer directory</span>
        </Link>
      </div>

      {/* Customer Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-xl">
              {customer.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {customer.company}
                </h2>
                <Tag color={getStatusTagColor(customer.status)} className="capitalize font-semibold rounded-md">
                  {customer.status}
                </Tag>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Primary Contact: {customer.name}</p>
            </div>
          </div>

          {canEdit && (
            <Link href={`/interactions?action=new&customer_id=${customer.id}`}>
              <Button
                type="primary"
                icon={<Plus className="h-4 w-4" />}
                size="middle"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-xs flex items-center gap-1"
              >
                Log Interaction
              </Button>
            </Link>
          )}
        </div>

        {/* Contact details pills */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{customer.phone || 'No phone recorded'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Customer since {formatDate(customer.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Interactions History for this customer */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Interaction History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of meetings, calls, and email touchpoints with AI summaries
            </p>
          </div>
          <Tag className="rounded-full font-semibold">
            {interactions.length} Total
          </Tag>
        </div>

        {interactionsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spin />
          </div>
        ) : interactions.length === 0 ? (
          <div className="py-8">
            <Empty description="No interactions logged for this customer yet." />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {interactions.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/interactions/${item.id}`}
                      className="font-semibold text-sm text-slate-900 hover:text-indigo-600 inline-flex items-center gap-1.5"
                    >
                      <span>{item.subject}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="uppercase text-[10px] font-bold text-slate-500">
                        {item.type}
                      </span>
                      <span>•</span>
                      <span>{formatDate(item.interaction_date)}</span>
                    </div>

                    {item.insight && (
                      <div className="mt-2.5 rounded-xl bg-slate-50 p-3 text-xs border border-slate-200/80">
                        <div className="flex items-center gap-1.5 font-semibold text-indigo-700 mb-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>AI Insight Summary</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{item.insight.summary}</p>

                        {item.insight.action_items?.length > 0 && (
                          <div className="mt-2 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">Next steps: </span>
                            {item.insight.action_items[0]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {item.insight && (
                    <Tag
                      color={getSentimentTagColor(item.insight.sentiment)}
                      className="shrink-0 capitalize font-semibold rounded-md"
                    >
                      {item.insight.sentiment}
                    </Tag>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
