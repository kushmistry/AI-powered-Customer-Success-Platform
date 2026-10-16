'use client';

import React from 'react';
import Link from 'next/link';
import { Interaction } from '@/types';
import { formatDate } from '@/lib/utils';
import { Tag } from '@e2m/ui';
import { MessageSquare, Phone, Mail, ArrowUpRight, Sparkles } from 'lucide-react';

interface RecentInteractionsProps {
  interactions: Interaction[];
}

export default function RecentInteractions({ interactions = [] }: RecentInteractionsProps) {
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Customer Interactions</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest recorded touchpoints and AI-generated takeaways
          </p>
        </div>
        <Link
          href="/interactions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
        >
          <span>View all</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {interactions.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          No interactions logged yet. Record your first interaction to see AI insights!
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {interactions.map((inter) => (
            <div key={inter.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                    {getTypeIcon(inter.type)}
                  </div>
                  <div>
                    <Link
                      href={`/interactions/${inter.id}`}
                      className="font-semibold text-sm text-slate-900 hover:text-indigo-600 line-clamp-1"
                    >
                      {inter.subject}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">
                        {inter.customer?.company || 'Unknown Company'}
                      </span>
                      <span>•</span>
                      <span>{inter.customer?.name}</span>
                      <span>•</span>
                      <span>{formatDate(inter.interaction_date)}</span>
                    </div>

                    {inter.insight && (
                      <div className="mt-2.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-150">
                        <div className="flex items-center gap-1.5 text-indigo-700 font-semibold mb-1">
                          <Sparkles className="h-3 w-3" />
                          <span>AI Summary</span>
                        </div>
                        <p className="line-clamp-2 leading-relaxed text-slate-600">
                          {inter.insight.summary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {inter.insight && (
                  <Tag
                    color={
                      inter.insight.sentiment === 'positive'
                        ? 'success'
                        : inter.insight.sentiment === 'negative'
                        ? 'error'
                        : 'warning'
                    }
                    className="shrink-0 capitalize font-semibold rounded-md"
                  >
                    {inter.insight.sentiment}
                  </Tag>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

