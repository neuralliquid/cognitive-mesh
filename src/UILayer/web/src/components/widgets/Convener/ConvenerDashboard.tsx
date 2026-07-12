'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SessionTimeline from './SessionTimeline';
import {
  discoverConvenerChampions,
  getConvenerCommunityPulse,
  getConvenerInnovationSpread,
  getConvenerLearningRecommendations,
} from '../api';
import type {
  ChampionSummary,
  CommunityPulseResponse,
  InnovationSpreadResult,
  LearningCatalystResponse,
} from '../types';

type EndpointKey = 'champions' | 'pulse' | 'learning' | 'innovation';

interface EndpointResult<T> {
  data: T | null;
  error: string | null;
}

interface ConvenerDashboardProps {
  skill?: string;
  channelId?: string;
  ideaId?: string;
}

async function capture<T>(request: Promise<T>): Promise<EndpointResult<T>> {
  try {
    return { data: await request, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Request failed.',
    };
  }
}

function formatPercent(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${Math.round(value)}%`;
}

function formatScore(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return value.toFixed(2);
}

function formatActivityType(value: string | number): string {
  if (typeof value === 'string') return value;
  const labels = ['Article', 'Course', 'Mentorship', 'Project', 'Peer Session'];
  return labels[value] ?? 'Learning';
}

/**
 * FE-018: Convener Dashboard widget.
 *
 * Displays live Convener API data exposed by ApiHost when the backend services
 * are reachable, with partial rendering for unavailable endpoints.
 */
export default function ConvenerDashboard({
  skill = '',
  channelId = 'default-channel',
  ideaId = 'default-idea',
}: ConvenerDashboardProps) {
  const [champions, setChampions] = useState<ChampionSummary[]>([]);
  const [totalEvaluated, setTotalEvaluated] = useState(0);
  const [pulse, setPulse] = useState<CommunityPulseResponse | null>(null);
  const [learning, setLearning] = useState<LearningCatalystResponse | null>(null);
  const [innovation, setInnovation] = useState<InnovationSpreadResult | null>(null);
  const [errors, setErrors] = useState<Partial<Record<EndpointKey, string>>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const [championResult, pulseResult, learningResult, innovationResult] =
      await Promise.all([
        capture(discoverConvenerChampions(skill, 5)),
        capture(getConvenerCommunityPulse(channelId, 30)),
        capture(getConvenerLearningRecommendations({ focusAreas: skill ? [skill] : [], maxRecommendations: 5 })),
        capture(getConvenerInnovationSpread(ideaId)),
      ]);

    setChampions(championResult.data?.champions ?? []);
    setTotalEvaluated(championResult.data?.totalEvaluated ?? 0);
    setPulse(pulseResult.data);
    setLearning(learningResult.data);
    setInnovation(innovationResult.data);

    setErrors({
      ...(championResult.error ? { champions: championResult.error } : {}),
      ...(pulseResult.error ? { pulse: pulseResult.error } : {}),
      ...(learningResult.error ? { learning: learningResult.error } : {}),
      ...(innovationResult.error ? { innovation: innovationResult.error } : {}),
    });
    setLoading(false);
  }, [channelId, ideaId, skill]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchData(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  const errorEntries = Object.entries(errors);
  const hasAnyData =
    champions.length > 0 ||
    Boolean(pulse) ||
    Boolean(learning?.recommendations.length) ||
    Boolean(innovation);

  const timelineSessions = useMemo(() => {
    const sessions = [];

    if (champions.length > 0) {
      sessions.push({
        sessionId: 'champion-discovery',
        title: `Champion discovery returned ${champions.length} match${champions.length === 1 ? '' : 'es'}`,
        status: 'completed' as const,
        startedAt: champions[0]?.lastActiveDate ?? new Date().toISOString(),
        participants: champions.length,
      });
    }

    if (pulse) {
      sessions.push({
        sessionId: 'community-pulse',
        title: `Community pulse for ${pulse.channelId}`,
        status: 'active' as const,
        startedAt: pulse.endDate ?? new Date().toISOString(),
        participants: pulse.engagement?.activeUsers ?? 0,
      });
    }

    if (learning?.recommendations.length) {
      sessions.push({
        sessionId: 'learning-catalysts',
        title: 'Learning catalyst recommendations refreshed',
        status: 'scheduled' as const,
        startedAt: new Date().toISOString(),
        participants: learning.recommendations.length,
      });
    }

    if (innovation) {
      sessions.push({
        sessionId: `innovation-${innovation.ideaId}`,
        title: `Innovation spread phase: ${innovation.phase}`,
        status: 'completed' as const,
        startedAt: innovation.proposedAt,
        participants: innovation.adoptionCount,
      });
    }

    return sessions;
  }, [champions, innovation, learning, pulse]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading Convener Dashboard">
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((key) => (
            <div key={key} className="h-24 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="h-56 animate-pulse rounded-lg bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6" role="region" aria-label="Convener Dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Convener</h1>
          <p className="text-xs text-gray-400">
            Champion discovery, community pulse, learning catalysts, and innovation spread
          </p>
        </div>
        <button
          onClick={() => void fetchData()}
          className="rounded bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/15"
        >
          Refresh
        </button>
      </div>

      {errorEntries.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4" role="status">
          <p className="text-sm font-medium text-amber-300">
            Some Convener endpoints are unavailable.
          </p>
          <ul className="mt-2 space-y-1">
            {errorEntries.map(([key, message]) => (
              <li key={key} className="text-xs text-amber-200/80">
                {key}: {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasAnyData && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-gray-300">No Convener data is available yet.</p>
          <p className="mt-1 text-xs text-gray-500">
            The dashboard is wired to the ApiHost Convener routes and will populate as those services return data.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Champions" value={String(champions.length)} detail={`${totalEvaluated} evaluated`} />
        <MetricCard
          label="Safety Score"
          value={formatPercent(pulse?.psychologicalSafety?.safetyScore)}
          detail={pulse?.psychologicalSafety?.riskLevel ?? 'No pulse data'}
        />
        <MetricCard
          label="Learning Items"
          value={String(learning?.recommendations.length ?? 0)}
          detail={`${learning?.identifiedGaps.length ?? 0} skill gaps`}
        />
        <MetricCard
          label="Adoption Rate"
          value={formatPercent(innovation?.adoptionRatePercent)}
          detail={innovation ? `${innovation.adoptionCount} adopters` : 'No spread data'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-300">Top Champions</h2>
          {champions.length === 0 ? (
            <p className="text-sm text-gray-500">No champion matches returned.</p>
          ) : (
            <div className="space-y-3">
              {champions.map((champion) => (
                <div key={champion.userId} className="rounded border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-gray-200">{champion.userId}</p>
                    <span className="text-xs font-medium text-cyan-300">
                      {formatScore(champion.influenceScore)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {champion.interactionCount} interactions - active {new Date(champion.lastActiveDate).toLocaleDateString()}
                  </p>
                  {champion.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {champion.skills.slice(0, 4).map((item) => (
                        <span key={item} className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-300">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-300">Community Pulse</h2>
          {!pulse ? (
            <p className="text-sm text-gray-500">No community pulse returned.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Messages" value={String(pulse.engagement?.totalMessages ?? 0)} detail={pulse.engagement?.engagementTrend ?? 'No trend'} compact />
              <MetricCard label="Active Users" value={String(pulse.engagement?.activeUsers ?? 0)} detail={`${pulse.engagement?.totalReactions ?? 0} reactions`} compact />
              <MetricCard label="Sentiment" value={formatScore(pulse.sentiment?.averageSentiment)} detail={`${formatPercent((pulse.sentiment?.positiveRatio ?? 0) * 100)} positive`} compact />
              <MetricCard label="Risk" value={pulse.psychologicalSafety?.riskLevel ?? '-'} detail={`${formatPercent(pulse.psychologicalSafety?.safetyScore)} safety`} compact />
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-300">Learning Catalysts</h2>
          {!learning?.recommendations.length ? (
            <p className="text-sm text-gray-500">No recommendations returned.</p>
          ) : (
            <div className="space-y-3">
              {learning.recommendations.slice(0, 5).map((item) => (
                <div key={`${item.title}-${item.targetSkill}`} className="rounded border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-200">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description}</p>
                    </div>
                    <span className="shrink-0 text-xs text-cyan-300">{formatScore(item.relevanceScore)}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {formatActivityType(item.activityType)} - {item.targetSkill} - {item.estimatedMinutes} min
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-300">Recent Convener Signals</h2>
          <SessionTimeline sessions={timelineSessions} />
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  compact = false,
}: {
  label: string;
  value: string;
  detail: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/5 ${compact ? 'p-3' : 'p-4'}`}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`${compact ? 'text-lg' : 'text-2xl'} mt-1 font-bold text-white`}>{value}</p>
      <p className="mt-1 truncate text-xs text-gray-500">{detail}</p>
    </div>
  );
}
