/**
 * Shared TypeScript types for Phase 15b widget dashboards.
 *
 * These types mirror the C# backend models from the corresponding controllers
 * (NISTComplianceController, AdaptiveBalanceController, ValueGenerationController,
 * ImpactMetricsController, CognitiveSandwichController).
 *
 * Once the OpenAPI spec is regenerated to include these endpoints, these types
 * can be replaced by the auto-generated ones from `services.d.ts`.
 */

// ───────────────────────────── NIST Compliance ─────────────────────────────

export interface NISTChecklistPillarScore {
  pillarId: string;
  pillarName: string;
  averageScore: number;
  statementCount: number;
}

export interface NISTScoreResponse {
  organizationId: string;
  overallScore: number;
  pillarScores: NISTChecklistPillarScore[];
  assessedAt: string;
}

export interface NISTGapItem {
  statementId: string;
  currentScore: number;
  targetScore: number;
  priority: string;
  recommendedActions: string[];
}

export interface NISTRoadmapResponse {
  organizationId: string;
  gaps: NISTGapItem[];
  generatedAt: string;
}

export interface NISTChecklistStatement {
  statementId: string;
  description: string;
  isComplete: boolean;
  evidenceCount: number;
  currentScore: number | null;
}

export interface NISTChecklistPillar {
  pillarId: string;
  pillarName: string;
  statements: NISTChecklistStatement[];
}

export interface NISTChecklistResponse {
  organizationId: string;
  pillars: NISTChecklistPillar[];
  totalStatements: number;
  completedStatements: number;
}

export interface NISTAuditEntry {
  entryId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details: string;
}

export interface NISTAuditLogResponse {
  organizationId: string;
  entries: NISTAuditEntry[];
  totalCount: number;
}

// ──────────────────────────── Adaptive Balance ──────────────────────────────

export interface SpectrumDimensionResult {
  dimension: string;
  value: number;
  lowerBound: number;
  upperBound: number;
  rationale: string;
}

export interface BalanceResponse {
  dimensions: SpectrumDimensionResult[];
  overallConfidence: number;
  generatedAt: string;
}

export interface SpectrumHistoryEntry {
  value: number;
  timestamp: string;
  source: string;
}

export interface SpectrumHistoryResponse {
  dimension: string;
  history: SpectrumHistoryEntry[];
}

export interface ReflexionStatusEntry {
  evaluationId: string;
  result: string;
  confidence: number;
  timestamp: string;
}

export interface ReflexionStatusResponse {
  recentResults: ReflexionStatusEntry[];
  hallucinationRate: number;
  averageConfidence: number;
}

// ─────────────────────────── Value Generation ───────────────────────────────

export interface ValueDiagnosticResponse {
  valueScore: number;
  valueProfile: string;
  strengths: string[];
  developmentOpportunities: string[];
}

export interface OrgBlindnessDetectionResponse {
  blindnessRiskScore: number;
  identifiedBlindSpots: string[];
}

// ──────────────────────────── Impact Metrics ────────────────────────────────

export type SafetyDimension =
  | 'TrustInAI'
  | 'FearOfReplacement'
  | 'ComfortWithAutomation'
  | 'WillingnessToExperiment'
  | 'TransparencyPerception'
  | 'ErrorTolerance';

export interface PsychologicalSafetyScore {
  scoreId: string;
  teamId: string;
  tenantId: string;
  overallScore: number;
  dimensions: Record<SafetyDimension, number>;
  surveyResponseCount: number;
  behavioralSignalCount: number;
  calculatedAt: string;
  confidenceLevel: string;
}

export type AdoptionAction =
  | 'Login'
  | 'FeatureUse'
  | 'FeatureIgnore'
  | 'Feedback'
  | 'Override'
  | 'HelpRequest'
  | 'WorkflowComplete';

export interface AdoptionTelemetry {
  telemetryId: string;
  userId: string;
  tenantId: string;
  toolId: string;
  action: AdoptionAction;
  timestamp: string;
  durationMs: number | null;
  context: string | null;
}

export interface ImpactReport {
  reportId: string;
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  safetyScore: number;
  alignmentScore: number;
  adoptionRate: number;
  overallImpactScore: number;
  recommendations: string[];
  generatedAt: string;
}

export interface ResistanceIndicator {
  indicatorType: string;
  severity: number;
  affectedUserCount: number;
  firstDetectedAt: string;
  description: string;
}

export interface ImpactAssessment {
  assessmentId: string;
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  productivityDelta: number;
  qualityDelta: number;
  timeToDecisionDelta: number;
  userSatisfactionScore: number;
  adoptionRate: number;
  resistanceIndicators: ResistanceIndicator[];
}

// ────────────────────────── Cognitive Sandwich ──────────────────────────────

export interface Phase {
  phaseId: string;
  phaseName: string;
  phaseType: string;
  status: string;
  order: number;
}

export interface SandwichProcess {
  processId: string;
  tenantId: string;
  name: string;
  createdAt: string;
  currentPhaseIndex: number;
  phases: Phase[];
  state: string;
  maxStepBacks: number;
  stepBackCount: number;
  cognitiveDebtThreshold: number;
}

export interface PhaseAuditEntry {
  entryId: string;
  processId: string;
  phaseId: string;
  eventType: string;
  timestamp: string;
  userId: string;
  details: string;
}

export interface CognitiveDebtAssessment {
  processId: string;
  phaseId: string;
  debtScore: number;
  isBreached: boolean;
  recommendations: string[];
  assessedAt: string;
}

// ─────────────────────────────── Convener ──────────────────────────────────

export interface ChampionSummary {
  userId: string;
  influenceScore: number;
  skills: string[];
  interactionCount: number;
  lastActiveDate: string;
}

export interface DiscoverChampionsResponse {
  champions: ChampionSummary[];
  totalEvaluated: number;
}

export interface EngagementMetrics {
  totalMessages: number;
  activeUsers: number;
  totalReactions: number;
  engagementTrend: string;
}

export interface SentimentMetrics {
  averageSentiment: number;
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
}

export interface PsychologicalSafetyMetrics {
  safetyScore: number;
  riskLevel: string;
}

export interface CommunityPulseResponse {
  channelId: string;
  startDate: string;
  endDate: string;
  engagement?: EngagementMetrics | null;
  sentiment?: SentimentMetrics | null;
  psychologicalSafety?: PsychologicalSafetyMetrics | null;
}

export interface LearningCatalystRequest {
  focusAreas?: string[];
  maxRecommendations?: number;
}

export interface LearningRecommendation {
  title: string;
  description: string;
  activityType: string | number;
  relevanceScore: number;
  targetSkill: string;
  estimatedMinutes: number;
  contributorUserId?: string | null;
}

export interface SkillGap {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  priority: string;
}

export interface LearningCatalystResponse {
  userId: string;
  recommendations: LearningRecommendation[];
  identifiedGaps: SkillGap[];
}

export interface AdoptionEvent {
  adopterUserId: string;
  adoptedAt: string;
  referredByUserId?: string | null;
  adoptionContext?: string | null;
}

export interface InnovationSpreadResult {
  ideaId: string;
  originatorUserId: string;
  proposedAt: string;
  adoptionCount: number;
  adoptionRatePercent: number;
  viralityScore: number;
  adoptionLineage: AdoptionEvent[];
  phase: string | number;
}

// ───────────────────────── Model Routing & Docket ──────────────────────────

export interface ModelRoutingStatus {
  status: string;
  provider: string;
  route: string;
  baseUrl: string;
  sluiceConfigured: boolean;
  directProviderFallbackAllowed: boolean;
  docketConfigured: boolean;
  docketMode: string;
  checkedAt: string;
  correlationId: string;
  recentRoutingEventCount: number;
  recentUsageEventCount: number;
}

export interface ModelRoutingEvent {
  correlationId: string;
  provider: string;
  route: string;
  status: string;
  message: string;
  occurredAt: string;
  latencyMs: number;
  totalTokens: number | null;
  policyOutcome: string;
}

export interface DocketUsageEvent {
  correlationId: string;
  tenantId: string;
  userId: string | null;
  source: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  estimatedCostUsd: number;
  policyOutcome: string;
  status: string;
  occurredAt: string;
}

export interface ModelRoutingSummary {
  status: ModelRoutingStatus;
  routingEvents: ModelRoutingEvent[];
  usageEvents: DocketUsageEvent[];
}

export interface CommandNexusRequest {
  command: string;
  context: string;
  tenantId?: string;
  userId?: string;
  correlationId?: string;
}

export interface CommandNexusResponse {
  correlationId: string;
  context: string;
  model: string;
  response: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  estimatedCostUsd: number;
  docketStatus: string;
  completedAt: string;
}
