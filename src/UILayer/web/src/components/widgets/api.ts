/**
 * API helper for Phase 15b widget dashboards.
 *
 * These endpoints are not yet in the auto-generated OpenAPI types, so we use
 * a typed fetch wrapper that reads the same NEXT_PUBLIC_API_BASE_URL env var
 * as the openapi-fetch client in `@/lib/api/client`.
 *
 * Once the OpenAPI spec is regenerated, migrate callers to `servicesApi.GET(...)`.
 */

function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (url) return url;
  return 'http://localhost:5000';
}

const BASE = getApiBaseUrl();

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ───────────────────────────── NIST Compliance ─────────────────────────────

import type {
  NISTScoreResponse,
  NISTRoadmapResponse,
  NISTChecklistResponse,
  NISTAuditLogResponse,
  BalanceResponse,
  SpectrumHistoryResponse,
  ReflexionStatusResponse,
  ValueDiagnosticResponse,
  OrgBlindnessDetectionResponse,
  AdoptionTelemetry,
  PsychologicalSafetyScore,
  ImpactReport,
  ResistanceIndicator,
  SandwichProcess,
  PhaseAuditEntry,
  CognitiveDebtAssessment,
  DiscoverChampionsResponse,
  CommunityPulseResponse,
  LearningCatalystRequest,
  LearningCatalystResponse,
  InnovationSpreadResult,
  ModelRoutingSummary,
} from './types';

type ApiObject = Record<string, unknown>;

function asObject(value: unknown): ApiObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ApiObject : {};
}

function readValue(source: ApiObject, camelKey: string, pascalKey: string): unknown {
  return source[camelKey] ?? source[pascalKey];
}

function readString(source: ApiObject, camelKey: string, pascalKey: string, fallback = ''): string {
  const value = readValue(source, camelKey, pascalKey);
  return typeof value === 'string' ? value : fallback;
}

function readNumber(source: ApiObject, camelKey: string, pascalKey: string, fallback = 0): number {
  const value = readValue(source, camelKey, pascalKey);
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readNullableNumber(source: ApiObject, camelKey: string, pascalKey: string): number | null {
  const value = readValue(source, camelKey, pascalKey);
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readBoolean(source: ApiObject, camelKey: string, pascalKey: string): boolean {
  const value = readValue(source, camelKey, pascalKey);
  return typeof value === 'boolean' ? value : false;
}

function readArray(source: ApiObject, camelKey: string, pascalKey: string): unknown[] {
  const value = readValue(source, camelKey, pascalKey);
  return Array.isArray(value) ? value : [];
}

function readDateString(source: ApiObject, camelKey: string, pascalKey: string): string {
  const value = readValue(source, camelKey, pascalKey);
  if (typeof value !== 'string') return new Date().toISOString();

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? new Date().toISOString() : value;
}

function normalizeNistScoreResponse(raw: unknown): NISTScoreResponse {
  const source = asObject(raw);
  return {
    organizationId: readString(source, 'organizationId', 'OrganizationId'),
    overallScore: readNumber(source, 'overallScore', 'OverallScore'),
    pillarScores: readArray(source, 'pillarScores', 'PillarScores').map((item) => {
      const pillar = asObject(item);
      return {
        pillarId: readString(pillar, 'pillarId', 'PillarId'),
        pillarName: readString(pillar, 'pillarName', 'PillarName', 'Unlabeled pillar'),
        averageScore: readNumber(pillar, 'averageScore', 'AverageScore'),
        statementCount: readNumber(pillar, 'statementCount', 'StatementCount'),
      };
    }),
    assessedAt: readDateString(source, 'assessedAt', 'AssessedAt'),
  };
}

function normalizeNistRoadmapResponse(raw: unknown): NISTRoadmapResponse {
  const source = asObject(raw);
  return {
    organizationId: readString(source, 'organizationId', 'OrganizationId'),
    gaps: readArray(source, 'gaps', 'Gaps').map((item) => {
      const gap = asObject(item);
      return {
        statementId: readString(gap, 'statementId', 'StatementId'),
        currentScore: readNumber(gap, 'currentScore', 'CurrentScore'),
        targetScore: readNumber(gap, 'targetScore', 'TargetScore'),
        priority: readString(gap, 'priority', 'Priority', 'Unknown'),
        recommendedActions: readArray(gap, 'recommendedActions', 'RecommendedActions')
          .filter((action): action is string => typeof action === 'string'),
      };
    }),
    generatedAt: readDateString(source, 'generatedAt', 'GeneratedAt'),
  };
}

function normalizeNistChecklistResponse(raw: unknown): NISTChecklistResponse {
  const source = asObject(raw);
  return {
    organizationId: readString(source, 'organizationId', 'OrganizationId'),
    pillars: readArray(source, 'pillars', 'Pillars').map((item) => {
      const pillar = asObject(item);
      return {
        pillarId: readString(pillar, 'pillarId', 'PillarId'),
        pillarName: readString(pillar, 'pillarName', 'PillarName', 'Unlabeled pillar'),
        statements: readArray(pillar, 'statements', 'Statements').map((statementItem) => {
          const statement = asObject(statementItem);
          return {
            statementId: readString(statement, 'statementId', 'StatementId'),
            description: readString(statement, 'description', 'Description'),
            isComplete: readBoolean(statement, 'isComplete', 'IsComplete'),
            evidenceCount: readNumber(statement, 'evidenceCount', 'EvidenceCount'),
            currentScore: readNullableNumber(statement, 'currentScore', 'CurrentScore'),
          };
        }),
      };
    }),
    totalStatements: readNumber(source, 'totalStatements', 'TotalStatements'),
    completedStatements: readNumber(source, 'completedStatements', 'CompletedStatements'),
  };
}

function normalizeNistAuditLogResponse(raw: unknown): NISTAuditLogResponse {
  const source = asObject(raw);
  return {
    organizationId: readString(source, 'organizationId', 'OrganizationId'),
    entries: readArray(source, 'entries', 'Entries').map((item) => {
      const entry = asObject(item);
      return {
        entryId: readString(entry, 'entryId', 'EntryId'),
        action: readString(entry, 'action', 'Action', 'UnknownAction'),
        performedBy: readString(entry, 'performedBy', 'PerformedBy', 'Unknown'),
        performedAt: readDateString(entry, 'performedAt', 'PerformedAt'),
        details: readString(entry, 'details', 'Details'),
      };
    }),
    totalCount: readNumber(source, 'totalCount', 'TotalCount'),
  };
}

const liveReadOptions: RequestInit = { cache: 'no-store' };

export async function getNistScore(organizationId: string): Promise<NISTScoreResponse> {
  const raw = await fetchJson<unknown>(`/api/v1/nist-compliance/organizations/${encodeURIComponent(organizationId)}/score`, liveReadOptions);
  return normalizeNistScoreResponse(raw);
}

export async function getNistRoadmap(organizationId: string): Promise<NISTRoadmapResponse> {
  const raw = await fetchJson<unknown>(`/api/v1/nist-compliance/organizations/${encodeURIComponent(organizationId)}/roadmap`, liveReadOptions);
  return normalizeNistRoadmapResponse(raw);
}

export async function getNistChecklist(organizationId: string): Promise<NISTChecklistResponse> {
  const raw = await fetchJson<unknown>(`/api/v1/nist-compliance/organizations/${encodeURIComponent(organizationId)}/checklist`, liveReadOptions);
  return normalizeNistChecklistResponse(raw);
}

export async function getNistAuditLog(organizationId: string, maxResults = 50): Promise<NISTAuditLogResponse> {
  const params = new URLSearchParams({ maxResults: Math.max(1, maxResults).toString() });
  const raw = await fetchJson<unknown>(
    `/api/v1/nist-compliance/organizations/${encodeURIComponent(organizationId)}/audit-log?${params.toString()}`,
    liveReadOptions,
  );
  return normalizeNistAuditLogResponse(raw);
}

// ──────────────────────────── Adaptive Balance ──────────────────────────────

export async function getAdaptiveBalance(context: Record<string, string> = {}): Promise<BalanceResponse> {
  return fetchJson('/api/v1/adaptive-balance/balance', {
    method: 'POST',
    body: JSON.stringify({ context }),
  });
}

export async function getSpectrumHistory(dimension: string): Promise<SpectrumHistoryResponse> {
  return fetchJson(`/api/v1/adaptive-balance/history/${encodeURIComponent(dimension)}`);
}

export async function getReflexionStatus(): Promise<ReflexionStatusResponse> {
  return fetchJson('/api/v1/adaptive-balance/reflexion-status');
}

// ─────────────────────────── Value Generation ───────────────────────────────

export async function runValueDiagnostic(
  targetId: string,
  targetType: string,
  tenantId: string,
): Promise<ValueDiagnosticResponse> {
  return fetchJson('/api/v1/ValueGeneration/value-diagnostic', {
    method: 'POST',
    body: JSON.stringify({ targetId, targetType, tenantId }),
  });
}

export async function detectOrgBlindness(
  organizationId: string,
  tenantId: string,
  departmentFilters: string[] = [],
): Promise<OrgBlindnessDetectionResponse> {
  return fetchJson('/api/v1/ValueGeneration/org-blindness/detect', {
    method: 'POST',
    body: JSON.stringify({ organizationId, tenantId, departmentFilters }),
  });
}

// ──────────────────────────── Impact Metrics ────────────────────────────────

export async function getSafetyScoreHistory(
  teamId: string,
  tenantId: string,
): Promise<PsychologicalSafetyScore[]> {
  return fetchJson(`/api/v1/impact-metrics/safety-score/${encodeURIComponent(teamId)}/history?tenantId=${encodeURIComponent(tenantId)}`);
}

export async function getImpactReport(
  tenantId: string,
  periodStart?: string,
  periodEnd?: string,
): Promise<ImpactReport> {
  const params = new URLSearchParams();
  if (periodStart) params.set('periodStart', periodStart);
  if (periodEnd) params.set('periodEnd', periodEnd);
  const qs = params.toString();
  return fetchJson(`/api/v1/impact-metrics/report/${encodeURIComponent(tenantId)}${qs ? `?${qs}` : ''}`);
}

export async function getResistancePatterns(tenantId: string): Promise<ResistanceIndicator[]> {
  return fetchJson(`/api/v1/impact-metrics/telemetry/${encodeURIComponent(tenantId)}/resistance`);
}

export async function getImpactUsageSummary(tenantId: string): Promise<AdoptionTelemetry[]> {
  return fetchJson(`/api/v1/impact-metrics/telemetry/${encodeURIComponent(tenantId)}/summary`);
}

// ────────────────────────── Cognitive Sandwich ──────────────────────────────

export async function getSandwichProcess(processId: string): Promise<SandwichProcess> {
  return fetchJson(`/api/v1/cognitive-sandwich/${encodeURIComponent(processId)}`);
}

export async function getSandwichAuditTrail(processId: string): Promise<PhaseAuditEntry[]> {
  return fetchJson(`/api/v1/cognitive-sandwich/${encodeURIComponent(processId)}/audit`);
}

export async function getSandwichDebt(processId: string): Promise<CognitiveDebtAssessment> {
  return fetchJson(`/api/v1/cognitive-sandwich/${encodeURIComponent(processId)}/debt`);
}

// ─────────────────────────────── Convener ──────────────────────────────────

export async function discoverConvenerChampions(
  skill = '',
  maxResults = 5,
): Promise<DiscoverChampionsResponse> {
  const params = new URLSearchParams({ maxResults: String(maxResults) });
  if (skill.trim()) params.set('skill', skill.trim());
  return fetchJson(`/api/v1/convener/discover/champions?${params.toString()}`);
}

export async function getConvenerCommunityPulse(
  channelId: string,
  timeframeInDays = 30,
): Promise<CommunityPulseResponse> {
  const params = new URLSearchParams({
    channelId,
    timeframeInDays: String(timeframeInDays),
  });
  return fetchJson(`/api/v1/convener/pulse/community?${params.toString()}`);
}

export async function getConvenerLearningRecommendations(
  request: LearningCatalystRequest = {},
): Promise<LearningCatalystResponse> {
  return fetchJson('/api/v1/convener/learning/catalysts/recommend', {
    method: 'POST',
    body: JSON.stringify({
      focusAreas: request.focusAreas ?? [],
      maxRecommendations: request.maxRecommendations ?? 5,
    }),
  });
}

export async function getConvenerInnovationSpread(
  ideaId: string,
): Promise<InnovationSpreadResult> {
  return fetchJson(`/api/v1/convener/innovation/spread/${encodeURIComponent(ideaId)}`);
}

// ───────────────────────── Model Routing & Docket ──────────────────────────

export async function getModelRoutingSummary(): Promise<ModelRoutingSummary> {
  return fetchJson('/api/v1/model-routing/summary', liveReadOptions);
}
