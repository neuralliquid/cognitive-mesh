/**
 * Dashboard store — replaces useDashboardData hook + DashboardAPI mock.
 *
 * Uses direct fetch() for dashboard endpoints (not yet in OpenAPI spec).
 * When backend adds /api/v1/dashboard/* endpoints, switch to servicesApi.
 * SignalR patches update individual fields.
 */
import { create } from "zustand"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

interface Layer {
  id: string
  name: string
  icon: string
  color: string
  uptime: number
  description: string
}

interface Metric {
  id: string
  label: string
  value: string
  change: string
  status: "up" | "stable" | "down"
  energy: number
  icon: string
}

interface AgentSummary {
  name: string
  status: "active" | "idle"
  tasks: number
  energy: number
}

interface Activity {
  time: string
  event: string
  type: string
}

interface SystemStatus {
  power: number
  load: number
  neuralNetwork: boolean
  quantumProcessing: boolean
}

interface DashboardEndpointFailure {
  endpoint: string
  message: string
  status?: number
  correlationId: string
  elapsedMs: number
}

interface DashboardStoreState {
  layers: Layer[]
  metrics: Metric[]
  agents: AgentSummary[]
  activities: Activity[]
  systemStatus: SystemStatus | null
  loading: boolean
  error: string | null
  lastFailures: DashboardEndpointFailure[]
  lastFetchedAt: number | null
}

interface DashboardStoreActions {
  fetchAll: () => Promise<void>
  refreshMetrics: () => Promise<void>
  refreshActivities: () => Promise<void>
  patchSystemStatus: (patch: Partial<SystemStatus>) => void
  patchMetric: (id: string, patch: Partial<Metric>) => void
  clearError: () => void
}

function createCorrelationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `cm-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function logDashboardFailure(failure: DashboardEndpointFailure) {
  console.warn("[dashboard] endpoint failed", failure)
}

async function fetchJson<T>(path: string): Promise<T> {
  const token = typeof localStorage !== "undefined"
    ? localStorage.getItem("cm_access_token")
    : null
  const correlationId = createCorrelationId()
  const startedAt = performance.now()
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "X-Correlation-ID": correlationId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const elapsedMs = Math.round(performance.now() - startedAt)
  if (!res.ok) {
    const failure: DashboardEndpointFailure = {
      endpoint: path,
      message: `${res.status} ${res.statusText}`,
      status: res.status,
      correlationId: res.headers.get("x-correlation-id") ?? correlationId,
      elapsedMs,
    }
    logDashboardFailure(failure)
    const error = new Error(`${failure.message}: ${path}`)
    ;(error as Error & { dashboardFailure?: DashboardEndpointFailure }).dashboardFailure = failure
    throw error
  }
  return (await res.json()) as T
}

function getFailure(error: unknown, endpoint: string): DashboardEndpointFailure {
  if (
    error instanceof Error &&
    "dashboardFailure" in error &&
    (error as Error & { dashboardFailure?: DashboardEndpointFailure }).dashboardFailure
  ) {
    return (error as Error & { dashboardFailure: DashboardEndpointFailure }).dashboardFailure
  }

  const failure = {
    endpoint,
    message: error instanceof Error ? error.message : "Request failed",
    correlationId: createCorrelationId(),
    elapsedMs: 0,
  }
  logDashboardFailure(failure)
  return failure
}

export const useDashboardStore = create<
  DashboardStoreState & DashboardStoreActions
>((set, get) => ({
  layers: [],
  metrics: [],
  agents: [],
  activities: [],
  systemStatus: null,
  loading: false,
  error: null,
  lastFailures: [],
  lastFetchedAt: null,

  fetchAll: async () => {
    set({ loading: true, error: null, lastFailures: [] })
    try {
      const endpoints = [
        "/api/v1/dashboard/layers",
        "/api/v1/dashboard/metrics",
        "/api/v1/dashboard/status",
      ] as const
      const [layersResult, metricsResult, statusResult] = await Promise.allSettled([
        fetchJson<Layer[]>(endpoints[0]),
        fetchJson<Metric[]>(endpoints[1]),
        fetchJson<SystemStatus>(endpoints[2]),
      ])
      const results = [layersResult, metricsResult, statusResult] as const

      const layers = layersResult.status === "fulfilled" ? layersResult.value : get().layers
      const metrics = metricsResult.status === "fulfilled" ? metricsResult.value : get().metrics
      const status = statusResult.status === "fulfilled" ? statusResult.value : get().systemStatus

      const failures = results.flatMap((result, index) =>
        result.status === "rejected"
          ? [getFailure(result.reason, endpoints[index])]
          : [],
      )
      const failedNames = failures.map((failure) => failure.endpoint.replace("/api/v1/dashboard/", ""))

      set({
        layers,
        metrics,
        systemStatus: status,
        loading: false,
        error: failures.length > 0 ? `Dashboard data failed to load: ${failedNames.join(", ")}` : null,
        lastFailures: failures,
        lastFetchedAt: Date.now(),
      })
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to fetch dashboard data",
        loading: false,
        lastFailures: [getFailure(err, "/api/v1/dashboard")],
      })
    }
  },

  refreshMetrics: async () => {
    try {
      const metrics = await fetchJson<Metric[]>("/api/v1/dashboard/metrics")
      set({ metrics, error: null, lastFailures: [] })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to refresh metrics",
        lastFailures: [getFailure(err, "/api/v1/dashboard/metrics")],
      })
    }
  },

  refreshActivities: async () => {
    try {
      const activities = await fetchJson<Activity[]>("/api/v1/dashboard/activities")
      set({ activities, error: null, lastFailures: [] })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to refresh activities",
        lastFailures: [getFailure(err, "/api/v1/dashboard/activities")],
      })
    }
  },

  patchSystemStatus: (patch) =>
    set((state) => ({
      systemStatus: state.systemStatus
        ? { ...state.systemStatus, ...patch }
        : null,
    })),

  patchMetric: (id, patch) =>
    set((state) => ({
      metrics: state.metrics.map((m) =>
        m.id === id ? { ...m, ...patch } : m
      ),
    })),

  clearError: () => set({ error: null, lastFailures: [] }),
}))
