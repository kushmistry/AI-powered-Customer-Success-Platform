'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  fetchInteractions,
  createInteraction,
  setInteractionFilters,
} from '@/lib/features/interactions/interactionSlice';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InteractionModal from '@/components/interactions/InteractionModal';
import { formatDate } from '@/lib/utils';
import { Button, Select, Tag, Pagination, Spin, Empty, DatePicker } from '@e2m/ui';
import dayjs from 'dayjs';
import {
  Plus,
  Filter,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

function InteractionsContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { list, total, page, pages, loading, actionLoading, filters } = useAppSelector(
    (state) => state.interactions
  );
  const { user } = useAppSelector((state) => state.auth);

  const [modalOpen, setModalOpen] = useState(false);
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const preselectedCust = searchParams.get('customer_id') || undefined;

  useEffect(() => {
    if (searchParams.get('action') === 'new' && canEdit) {
      setModalOpen(true);
    }
  }, [searchParams, canEdit]);

  useEffect(() => {
    dispatch(fetchInteractions(filters));
  }, [dispatch, filters]);

  const handleTypeFilter = (type: string) => {
    dispatch(
      setInteractionFilters({
        type: type === 'all' ? undefined : (type as any),
        page: 1,
      })
    );
  };

  const handleSaveInteraction = async (data: any) => {
    const res = await dispatch(createInteraction(data));
    if (createInteraction.fulfilled.match(res)) {
      const msg = res.payload._apiMessage || 'Interaction recorded successfully!';
      if (
        msg.toLowerCase().includes('took too long') ||
        msg.toLowerCase().includes('could not') ||
        msg.toLowerCase().includes('fallback') ||
        msg.toLowerCase().includes('unavailable')
      ) {
        toast(msg, { icon: '⚠️', duration: 6000 });
      } else {
        toast.success(msg, { duration: 4000 });
      }
      setModalOpen(false);
    } else {
      toast.error(res.payload || 'Failed to record interaction');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4 text-blue-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-violet-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
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
    <DashboardLayout title="Customer Interactions">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Interaction Log & Insights ({total})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track customer communications and generate structured intelligence from notes
          </p>
        </div>

        {canEdit && (
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
            size="middle"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-xs flex items-center gap-1"
          >
            Log Interaction
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-600">Filter by type:</span>
            <Select
              value={filters.type || 'all'}
              onChange={handleTypeFilter}
              size="middle"
              className="w-40"
              options={[
                { value: 'all', label: 'All Touchpoints' },
                { value: 'meeting', label: 'Meetings' },
                { value: 'call', label: 'Phone Calls' },
                { value: 'email', label: 'Emails' },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Date Range:</span>
            <DatePicker.RangePicker
              size="middle"
              className="rounded-xl"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
              value={
                filters.date_from && filters.date_to
                  ? [dayjs(filters.date_from), dayjs(filters.date_to)]
                  : null
              }
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  dispatch(
                    setInteractionFilters({
                      date_from: dates[0].startOf('day').toISOString(),
                      date_to: dates[1].endOf('day').toISOString(),
                      page: 1,
                    })
                  );
                } else {
                  dispatch(
                    setInteractionFilters({
                      date_from: undefined,
                      date_to: undefined,
                      page: 1,
                    })
                  );
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spin size="large" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center">
            <Empty
              description={
                <span className="text-xs text-slate-500">
                  Record a meeting or call note to generate structured AI insights.
                </span>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {list.map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/interactions/${item.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-indigo-600"
                        >
                          {item.subject}
                        </Link>
                        {item.insight && (
                          <Tag
                            color={getSentimentTagColor(item.insight.sentiment)}
                            className="capitalize font-semibold rounded-md"
                          >
                            {item.insight.sentiment}
                          </Tag>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700">
                          {item.customer?.company || 'Customer'}
                        </span>
                        <span>•</span>
                        <span>{item.customer?.name}</span>
                        <span>•</span>
                        <span>{formatDate(item.interaction_date)}</span>
                      </div>

                      {/* AI Structured Preview */}
                      {item.insight && (
                        <div className="mt-3 rounded-xl bg-slate-50/90 p-3.5 text-xs border border-slate-200/70 space-y-2">
                          <div>
                            <div className="flex items-center gap-1.5 text-indigo-700 font-semibold mb-1">
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>AI Executive Summary</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                              {item.insight.summary}
                            </p>
                          </div>

                          {item.insight.action_items?.length > 0 && (
                            <div className="flex items-start gap-1.5 text-slate-600">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-slate-700">Key Action Item: </span>
                                <span>{item.insight.action_items[0]}</span>
                              </div>
                            </div>
                          )}

                          {item.insight.key_risks?.length > 0 && (
                            <div className="flex items-start gap-1.5 text-rose-700">
                              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-rose-800">Risk Identified: </span>
                                <span>{item.insight.key_risks[0]}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/interactions/${item.id}`}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Report</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > (filters.size || 10) && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-500">
              Showing page {page} of {pages} ({total} total)
            </span>
            <Pagination
              size="small"
              current={page}
              total={total}
              pageSize={filters.size || 10}
              onChange={(p) => dispatch(setInteractionFilters({ page: p }))}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      <InteractionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveInteraction}
        preselectedCustomerId={preselectedCust}
        loading={actionLoading}
      />
    </DashboardLayout>
  );
}

export default function InteractionsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex h-64 items-center justify-center">
            <Spin size="large" />
          </div>
        </DashboardLayout>
      }
    >
      <InteractionsContent />
    </Suspense>
  );
}
