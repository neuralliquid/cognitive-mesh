'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SafetyGauge from './SafetyGauge';
import ImpactRadar from './ImpactRadar';
import ImpactTimeline from './ImpactTimeline';
import { getImpactReport, getImpactUsageSummary, getResistancePatterns, getSafetyScoreHistory } from '../api';
import type { AdoptionTelemetry, ImpactReport, PsychologicalSafetyScore, ResistanceIndicator } from '../types';

interface ImpactMetricsDashboardProps {
  tenantId?: string;
  teamId?: string;
}

const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_MYSTIRA_TENANT_ID ?? 'demo-tenant';
const DEFAULT_TEAM_ID = process.env.NEXT_PUBLIC_IMPACT_METRICS_TEAM_ID ?? 'default-team';

function formatDimensionLabel(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace('AI', 'AI');
}

function toErrorMessage(value: unknown): string {
  return value instanceof Error ? value.message : 'Request failed.';
}

export default function ImpactMetricsDashboard({
  tenantId = DEFAULT_TENANT_ID,
  teamId = DEFAULT_TEAM_ID,
}: ImpactMetricsDashboardProps) {
  const [report, setReport] = useState<ImpactReport | null>(null);
  const [resistance, setResistance] = useState<ResistanceIndicator[]>([]);
  const [usage, setUsage] = useState<AdoptionTelemetry[]>([]);
  const [safetyHistory, setSafetyHistory] = useState<PsychologicalSafetyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setWarnings([]);

    const [reportResult, resistanceResult, usageResult, safetyResult] = await Promise.allSettled([
      getImpactReport(tenantId),
      getResistancePatterns(tenantId),
      getImpactUsageSummary(tenantId),
      getSafetyScoreHistory(teamId, tenantId),
    ]);

    const nextWarnings: string[] = [];

    if (reportResult.status === 'fulfilled') {
      setReport(reportResult.value);
    } else {
      setError(`Impact report unavailable: ${toErrorMessage(reportResult.reason)}`);
    }

    if (resistanceResult.status === 'fulfilled') {
      setResistance(resistanceResult.value);
    } else {
      nextWarnings.push(`Resistance patterns unavailable: ${toErrorMessage(resistanceResult.reason)}`);
    }

    if (usageResult.status === 'fulfilled') {
      setUsage(usageResult.value);
    } else {
      nextWarnings.push(`Usage summary unavailable: ${toErrorMessage(usageResult.reason)}`);
    }

    if (safetyResult.status === 'fulfilled') {
      setSafetyHistory(safetyResult.value);
    } else {
      nextWarnings.push(`Safety history unavailable: ${toErrorMessage(safetyResult.reason)}`);
    }

    setWarnings(nextWarnings);
    setLoading(false);
    setRefreshing(false);
  }, [teamId, tenantId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchData(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  const latestSafety = useMemo(
    () => [...safetyHistory].sort((a, b) => Date.parse(b.calculatedAt) - Date.parse(a.calculatedAt))[0],
    [safetyHistory],
  );

  const activeUsageCount = usage.filter((item) =>
    item.action === 'FeatureUse' ||
    item.action === 'WorkflowComplete' ||
    item.action === 'Login'
  ).length;

  const radarLabels: string[] = [];
  const radarValues: number[] = [];
  if (latestSafety && Object.keys(latestSafety.dimensions).length > 0) {
    for (const [label, value] of Object.entries(latestSafety.dimensions)) {
      radarLabels.push(formatDimensionLabel(label));
      radarValues.push(value);
    }
  } else if (report) {
    radarLabels.push('Safety', 'Alignment', 'Adoption', 'Overall');
    radarValues.push(report.safetyScore, report.alignmentScore * 100, report.adoptionRate * 100, report.overallImpactScore);
  }

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading Impact Metrics Dashboard">
        <div className="h-8 w-56 animate-pulse rounded bg-white/10" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((k) => <div key={k} className="h-40 animate-pulse rounded-lg bg-white/5" />)}
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-white/5" />
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6" role="alert">
        <h2 className="text-lg font-semibold text-red-400">Error loading impact metrics</h2>
        <p className="mt-1 text-sm text-red-300">{error}</p>
        <p className="mt-2 text-xs text-red-200/80">Tenant: {tenantId}</p>
        <button onClick={() => void fetchData(true)} className="mt-3 rounded bg-red-500/20 px-4 py-1.5 text-sm font-medium text-red-300 hover:bg-red-500/30">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="region" aria-label="Impact Metrics Dashboard" aria-busy={refreshing}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Impact Metrics</h1>
          {report && <p className="text-xs text-gray-400">Report generated {new Date(report.generatedAt).toLocaleDateString()} for tenant {tenantId}</p>}
        </div>
        <button onClick={() => void fetchData(true)} className="rounded bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/15" disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {(error || warnings.length > 0) && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4" role="status">
          {error && <p className="text-sm text-yellow-200">{error}</p>}
          {warnings.map((warning) => (
            <p key={warning} className="text-xs text-yellow-100/80">{warning}</p>
          ))}
        </div>
      )}

      {report && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <SafetyGauge score={report.safetyScore} label="Safety" />
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-xs text-gray-400">Alignment</p>
              <p className="text-3xl font-bold text-white">{(report.alignmentScore * 100).toFixed(0)}%</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-xs text-gray-400">Adoption Rate</p>
              <p className="text-3xl font-bold text-white">{(report.adoptionRate * 100).toFixed(0)}%</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-xs text-gray-400">Overall Impact</p>
              <p className="text-3xl font-bold text-white">{report.overallImpactScore.toFixed(0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-300">Impact Dimensions</h2>
              <ImpactRadar labels={radarLabels} values={radarValues} />
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-300">Live API Signals</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-500">Telemetry events</dt>
                  <dd className="text-2xl font-semibold text-white">{usage.length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Active-use events</dt>
                  <dd className="text-2xl font-semibold text-white">{activeUsageCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Safety history points</dt>
                  <dd className="text-2xl font-semibold text-white">{safetyHistory.length}</dd>
                </div>
              </dl>
            </div>
          </div>

          {report.recommendations.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-300">Recommendations</h2>
              <ul className="space-y-1">
                {report.recommendations.map((r, i) => <li key={i} className="text-xs text-gray-300">{r}</li>)}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Resistance Patterns</h2>
        <ImpactTimeline indicators={resistance} />
      </div>
    </div>
  );
}
