'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MaturityGauge from './MaturityGauge';
import GapAnalysisTable from './GapAnalysisTable';
import ComplianceTimeline from './ComplianceTimeline';
import { getNistScore, getNistRoadmap, getNistAuditLog, getNistChecklist } from '../api';
import type {
  NISTScoreResponse,
  NISTRoadmapResponse,
  NISTAuditEntry,
  NISTChecklistResponse,
} from '../types';

interface NistComplianceDashboardProps {
  organizationId?: string;
}

/**
 * FE-011: Main NIST Compliance Dashboard widget.
 *
 * Displays maturity scores, pillar breakdown, gap analysis, and an audit
 * event timeline sourced from the NISTComplianceController API.
 */
export default function NistComplianceDashboard({
  organizationId = 'default-org',
}: NistComplianceDashboardProps) {
  const [scoreData, setScoreData] = useState<NISTScoreResponse | null>(null);
  const [roadmapData, setRoadmapData] = useState<NISTRoadmapResponse | null>(null);
  const [auditEntries, setAuditEntries] = useState<NISTAuditEntry[]>([]);
  const [checklistData, setChecklistData] = useState<NISTChecklistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [endpointErrors, setEndpointErrors] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setEndpointErrors([]);

    const results = await Promise.allSettled([
      getNistScore(organizationId),
      getNistRoadmap(organizationId),
      getNistAuditLog(organizationId, 50),
      getNistChecklist(organizationId),
    ]);

    const nextErrors: string[] = [];
    const labels = ['score', 'roadmap', 'audit log', 'checklist'];

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const reason = result.reason instanceof Error ? result.reason.message : 'request failed';
        nextErrors.push(`${labels[index]}: ${reason}`);
      }
    });

    const [scoreResult, roadmapResult, auditResult, checklistResult] = results;

    if (scoreResult.status === 'fulfilled') {
      setScoreData(scoreResult.value);
    }

    if (roadmapResult.status === 'fulfilled') {
      setRoadmapData(roadmapResult.value);
    }

    if (auditResult.status === 'fulfilled') {
      setAuditEntries(auditResult.value.entries);
    }

    if (checklistResult.status === 'fulfilled') {
      setChecklistData(checklistResult.value);
    }

    setEndpointErrors(nextErrors);
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => void fetchData(), 0);
    return () => window.clearTimeout(refreshTimer);
  }, [fetchData]);

  const hasAnyData = Boolean(scoreData || roadmapData || auditEntries.length > 0 || checklistData);
  const failedCompletely = !loading && !hasAnyData && endpointErrors.length > 0;

  if (loading && !hasAnyData) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading NIST Compliance Dashboard">
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-48 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-white/5" />
      </div>
    );
  }

  if (failedCompletely) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6" role="alert">
        <h2 className="text-lg font-semibold text-red-400">Error loading compliance data</h2>
        <p className="mt-1 text-sm text-red-300">{endpointErrors.join('; ')}</p>
        <button
          onClick={() => void fetchData()}
          className="mt-3 rounded bg-red-500/20 px-4 py-1.5 text-sm font-medium text-red-300 hover:bg-red-500/30"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      role="region"
      aria-label="NIST Compliance Dashboard"
      aria-busy={loading}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">NIST AI RMF Compliance</h1>
          {scoreData && (
            <p className="text-xs text-gray-400">
              Assessed {new Date(scoreData.assessedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <button
          onClick={() => void fetchData()}
          disabled={loading}
          className="rounded bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {endpointErrors.length > 0 && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4" role="status">
          <h2 className="text-sm font-semibold text-yellow-200">Some live compliance data did not load</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-yellow-100/90">
            {endpointErrors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {checklistData && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase text-gray-500">Checklist Progress</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {checklistData.completedStatements}/{checklistData.totalStatements}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase text-gray-500">Tracked Pillars</p>
            <p className="mt-1 text-2xl font-semibold text-white">{checklistData.pillars.length}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase text-gray-500">Open Statements</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {Math.max(0, checklistData.totalStatements - checklistData.completedStatements)}
            </p>
          </div>
        </div>
      )}

      {/* Gauges row */}
      {scoreData && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Overall maturity */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <MaturityGauge score={scoreData.overallScore} label="Overall Maturity" />
          </div>

          {/* Top 3 pillar scores */}
          {scoreData.pillarScores.slice(0, 3).map((ps) => (
            <div key={ps.pillarId} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <MaturityGauge score={ps.averageScore} label={ps.pillarName} />
            </div>
          ))}
        </div>
      )}

      {/* Pillar breakdown table */}
      {scoreData && scoreData.pillarScores.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-300">Pillar Breakdown</h2>
          <div className="space-y-2">
            {scoreData.pillarScores.map((ps) => {
              const pct = (ps.averageScore / 5) * 100;
              return (
                <div key={ps.pillarId} className="flex items-center gap-3">
                  <span className="w-32 truncate text-xs text-gray-400">{ps.pillarName}</span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 text-right text-xs font-medium text-gray-300">
                    {ps.averageScore.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gap analysis */}
      {roadmapData && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-300">Gap Analysis</h2>
          <GapAnalysisTable gaps={roadmapData.gaps} />
        </div>
      )}

      {/* Audit timeline */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Compliance Timeline</h2>
        <ComplianceTimeline entries={auditEntries} />
      </div>
    </div>
  );
}
