'use client';

import React from 'react';
import { ThumbsUp, Minus, ThumbsDown } from 'lucide-react';

interface SentimentChartProps {
  distribution: Record<string, number>;
}

export default function SentimentChart({ distribution = {} }: SentimentChartProps) {
  const positive = distribution.positive || 0;
  const neutral = distribution.neutral || 0;
  const negative = distribution.negative || 0;
  const total = positive + neutral + negative;

  const posPct = total > 0 ? Math.round((positive / total) * 100) : 0;
  const neuPct = total > 0 ? Math.round((neutral / total) * 100) : 0;
  const negPct = total > 0 ? Math.round((negative / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">AI Meeting Sentiment</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time mood analysis extracted from customer interactions
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {total} Analyzed
        </span>
      </div>

      {/* Progress Bar Segmented */}
      <div className="h-3.5 w-full flex overflow-hidden rounded-full bg-slate-100 p-0.5 gap-0.5 my-5">
        {posPct > 0 && (
          <div
            style={{ width: `${posPct}%` }}
            className="h-full rounded-l-full bg-emerald-500 transition-all duration-500"
            title={`Positive: ${positive} (${posPct}%)`}
          />
        )}
        {neuPct > 0 && (
          <div
            style={{ width: `${neuPct}%` }}
            className="h-full bg-amber-400 transition-all duration-500"
            title={`Neutral: ${neutral} (${neuPct}%)`}
          />
        )}
        {negPct > 0 && (
          <div
            style={{ width: `${negPct}%` }}
            className="h-full rounded-r-full bg-rose-500 transition-all duration-500"
            title={`Negative: ${negative} (${negPct}%)`}
          />
        )}
      </div>

      {/* Legend & Stats */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50/60 border border-emerald-100/80">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>Positive</span>
          </div>
          <span className="text-lg font-bold text-emerald-900 mt-1">{positive}</span>
          <span className="text-[11px] text-emerald-600 font-medium">{posPct}%</span>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50/60 border border-amber-100/80">
          <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-xs">
            <Minus className="h-3.5 w-3.5" />
            <span>Neutral</span>
          </div>
          <span className="text-lg font-bold text-amber-900 mt-1">{neutral}</span>
          <span className="text-[11px] text-amber-600 font-medium">{neuPct}%</span>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-50/60 border border-rose-100/80">
          <div className="flex items-center gap-1.5 text-rose-700 font-semibold text-xs">
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>Negative</span>
          </div>
          <span className="text-lg font-bold text-rose-900 mt-1">{negative}</span>
          <span className="text-[11px] text-rose-600 font-medium">{negPct}%</span>
        </div>
      </div>
    </div>
  );
}

