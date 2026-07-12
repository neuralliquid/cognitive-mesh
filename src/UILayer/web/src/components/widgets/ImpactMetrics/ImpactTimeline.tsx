'use client';

import React from 'react';
import type { ResistanceIndicator } from '../types';

interface ImpactTimelineProps {
  indicators: ResistanceIndicator[];
}

function severityLabel(severity: number): string {
  if (severity >= 0.7) return 'High';
  if (severity >= 0.35) return 'Medium';
  return 'Low';
}

function severityBadgeClass(severity: number): string {
  if (severity >= 0.7) return 'bg-red-500/20 text-red-400';
  if (severity >= 0.35) return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-gray-500/20 text-gray-400';
}

export default function ImpactTimeline({ indicators }: ImpactTimelineProps) {
  if (indicators.length === 0) {
    return <p className="text-sm text-gray-500">No resistance patterns detected.</p>;
  }
  return (
    <div className="space-y-3" role="list" aria-label="Resistance pattern timeline">
      {indicators.map((ind) => (
        <div key={`${ind.indicatorType}-${ind.firstDetectedAt}`} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3" role="listitem">
          <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-300">{ind.indicatorType}</span>
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${severityBadgeClass(ind.severity)}`}>{severityLabel(ind.severity)}</span>
            </div>
            <p className="mt-0.5 text-xs text-gray-400">{ind.description}</p>
            <p className="mt-1 text-xs text-gray-500">{ind.affectedUserCount} affected users - {new Date(ind.firstDetectedAt).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
