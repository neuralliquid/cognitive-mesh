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
