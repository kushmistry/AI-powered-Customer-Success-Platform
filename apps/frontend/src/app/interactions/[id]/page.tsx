'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { fetchInteractionById } from '@/lib/features/interactions/interactionSlice';
import { generateInsight } from '@/lib/features/insights/insightSlice';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate } from '@/lib/utils';
import { Button, Tag, Spin, Alert, Tooltip } from '@e2m/ui';
import {
  ArrowLeft,
  RotateCw,
  Calendar,
  Building2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function InteractionDetailPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const interactionId = params.id as string;

  const { detail: interaction, detailLoading } = useAppSelector((state) => state.interactions);
  const { user } = useAppSelector((state) => state.auth);
  const [regenerating, setRegenerating] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (interactionId) {
      dispatch(fetchInteractionById(interactionId));
    }
  }, [dispatch, interactionId]);

  const handleRegenerateInsight = async () => {
    setRegenerating(true);
    try {
      const res = await dispatch(generateInsight({ interactionId }));
      if (generateInsight.fulfilled.match(res)) {
        const msg = res.payload._apiMessage || 'AI Insights generated successfully!';
        if (
          msg.toLowerCase().includes('busy') ||
          msg.toLowerCase().includes('fallback') ||
          msg.toLowerCase().includes('could not')
        ) {
          toast(msg, { icon: '⚠️', duration: 5000 });
        } else {
          toast.success(msg, { duration: 4000 });
        }
        dispatch(fetchInteractionById(interactionId));
      } else {
        toast.error(res.payload || 'Failed to generate insights');
      }
    } finally {
      setRegenerating(false);
    }
  };

  if (detailLoading) {
    return (
      <DashboardLayout title="Loading Interaction...">
        <div className="flex h-64 items-center justify-center">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!interaction) {
    return (
      <DashboardLayout title="Interaction Not Found">
        <div className="p-6">
          <Alert
            message="Interaction Not Found"
            description="The requested meeting or call note could not be retrieved."
            type="error"
            showIcon
            action={
              <Link href="/interactions">
                <Button size="small" type="primary" danger>
                  Return to List
                </Button>
              </Link>
            }
            className="rounded-2xl"
          />
        </div>
      </DashboardLayout>
    );
  }

  const insight = interaction.insight;

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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-5 w-5 text-emerald-600" />;
      case 'negative':
        return <ThumbsDown className="h-5 w-5 text-rose-600" />;
      default:
        return <Minus className="h-5 w-5 text-amber-600" />;
    }
  };

  return (
    <DashboardLayout title={interaction.subject}>
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/interactions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to all interactions</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Meeting Details & Raw Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <Tag color="purple" className="uppercase font-bold text-[10px] tracking-wider rounded-md">
                  {interaction.type}
                </Tag>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-2">
                  {interaction.subject}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatDate(interaction.interaction_date)}</span>
                  </span>
                  <span>•</span>
                  <span>Recorded by team</span>
                </div>
              </div>

              {interaction.customer && (
                <Link
                  href={`/customers/${interaction.customer.id}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-right hover:border-indigo-200 transition-colors block"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 justify-end">
                    <Building2 className="h-3.5 w-3.5 text-slate-500" />
                    <span>{interaction.customer.company}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{interaction.customer.name}</span>
                </Link>
              )}
            </div>

            {/* Raw Meeting Notes Section */}
            <div className="mt-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>Original Meeting Transcript / Notes</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-mono border border-slate-200/80">
                {interaction.notes}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Intelligence Dashboard */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Meeting Intelligence</h3>
                  <p className="text-[10px] text-indigo-700 font-medium">Powered by Google Gemini</p>
                </div>
              </div>

              {canEdit && (
                <Tooltip title="Re-run AI analysis on meeting notes">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<RotateCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />}
                    onClick={handleRegenerateInsight}
                    loading={regenerating}
                    className="text-indigo-600 hover:bg-indigo-100/70"
                  />
                </Tooltip>
              )}
            </div>

            {!insight ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <p>No insights generated for this note yet.</p>
                {canEdit && (
                  <Button
                    type="primary"
                    onClick={handleRegenerateInsight}
                    loading={regenerating}
                    icon={<Sparkles className="h-3.5 w-3.5" />}
                    className="mt-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold"
                  >
                    Generate Insights Now
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                {/* 1. Sentiment Badge Card */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Detected Customer Sentiment
                  </span>
                  <div
                    className={`flex items-center gap-2.5 rounded-xl p-3 border ${
                      insight.sentiment === 'positive'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : insight.sentiment === 'negative'
                        ? 'bg-rose-50 text-rose-900 border-rose-200'
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}
                  >
                    {getSentimentIcon(insight.sentiment)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold capitalize">{insight.sentiment}</span>
                        <Tag color={getSentimentTagColor(insight.sentiment)} className="capitalize rounded-sm text-[10px]">
                          {insight.sentiment}
                        </Tag>
                      </div>
                      <p className="text-[11px] opacity-80 mt-0.5">
                        {insight.sentiment === 'positive'
                          ? 'Customer expresses high satisfaction and willingness to expand.'
                          : insight.sentiment === 'negative'
                          ? 'Immediate attention required; concerns or frustration noted.'
                          : 'Informational dialogue with steady, neutral tone.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Executive Summary */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Executive Summary
                  </span>
                  <p className="text-xs leading-relaxed text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    {insight.summary}
                  </p>
                </div>

                {/* 3. Action Items */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Action Items ({insight.action_items?.length || 0})
                  </span>
                  {insight.action_items?.length > 0 ? (
                    <div className="space-y-1.5">
                      {insight.action_items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 rounded-lg bg-white p-2.5 text-xs text-slate-700 border border-slate-200"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No specific action items identified.</p>
                  )}
                </div>

                {/* 4. Key Risks or Blockers */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Key Risks & Blockers ({insight.key_risks?.length || 0})
                  </span>
                  {insight.key_risks?.length > 0 ? (
                    <div className="space-y-1.5">
                      {insight.key_risks.map((risk, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 rounded-lg bg-rose-50/80 p-2.5 text-xs text-rose-800 border border-rose-200/80"
                        >
                          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{risk}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-emerald-50/50 p-2.5 text-xs text-emerald-700 border border-emerald-100 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>No major risks or blockers detected.</span>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
                  Last analyzed on {formatDate(insight.generated_at)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
