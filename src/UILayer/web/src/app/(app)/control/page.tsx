"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Brain,
  GripVertical,
  LayoutDashboard,
  Maximize2,
  Mic,
  Minimize2,
  Move,
  Radio,
  RefreshCw,
  RotateCcw,
  Scale,
  Send,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Square,
  Workflow,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { executeCommandNexus, getAdaptiveBalance, getModelRoutingSummary } from "@/components/widgets/api"
import type { BalanceResponse, ModelRoutingSummary } from "@/components/widgets/types"

type PanelId = "command" | "metrics" | "main" | "tools" | "activity"
type PanelMode = "docked" | "floating"
type WidgetId = "agents" | "reasoning" | "analytics" | "security" | "adaptiveBalance" | "modelRouting" | "resources" | "activity"
type CommandContext = "agents" | "reasoning" | "analytics" | "security"

interface PanelState {
  id: PanelId
  title: string
  mode: PanelMode
  x: number
  y: number
  width: number
  height: number
  widgets: WidgetId[]
}

interface WidgetDefinition {
  id: WidgetId
  label: string
  description: string
  icon: LucideIcon
  color: string
  defaultPanel: PanelId
}

const STORAGE_KEY = "cm_control_layout_v1"

const widgets: WidgetDefinition[] = [
  {
    id: "agents",
    label: "Agents",
    description: "Agent readiness, tasks, and orchestration state.",
    icon: Bot,
    color: "text-sky-300",
    defaultPanel: "command",
  },
  {
    id: "reasoning",
    label: "Reasoning",
    description: "Reasoning pipeline, confidence, and active context.",
    icon: Brain,
    color: "text-cyan-300",
    defaultPanel: "command",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Mesh metrics, throughput, and signal quality.",
    icon: BarChart3,
    color: "text-purple-300",
    defaultPanel: "metrics",
  },
  {
    id: "security",
    label: "Security",
    description: "Policy posture, guardrails, and active controls.",
    icon: Shield,
    color: "text-emerald-300",
    defaultPanel: "metrics",
  },
  {
    id: "adaptiveBalance",
    label: "Adaptive Balance",
    description: "Live spectrum posture, confidence, and governance balance.",
    icon: Scale,
    color: "text-amber-300",
    defaultPanel: "metrics",
  },
  {
    id: "resources",
    label: "Resources",
    description: "Compute pressure, memory, model routing, and queues.",
    icon: Workflow,
    color: "text-amber-300",
    defaultPanel: "main",
  },
  {
    id: "modelRouting",
    label: "Model Routing & Cost",
    description: "Sluice routing status, Docket usage, cost, and policy outcomes.",
    icon: Workflow,
    color: "text-cyan-300",
    defaultPanel: "main",
  },
  {
    id: "activity",
    label: "Activity",
    description: "Recent command, diagnostic, and telemetry events.",
    icon: Radio,
    color: "text-rose-300",
    defaultPanel: "activity",
  },
]

const defaultPanels: PanelState[] = [
  {
    id: "command",
    title: "Command Center",
    mode: "docked",
    x: 300,
    y: 120,
    width: 680,
    height: 220,
    widgets: ["agents", "reasoning"],
  },
  {
    id: "metrics",
    title: "Metrics Dashboard",
    mode: "docked",
    x: 280,
    y: 370,
    width: 780,
    height: 220,
    widgets: ["analytics", "security", "adaptiveBalance"],
  },
  {
    id: "main",
    title: "Main Modules",
    mode: "docked",
    x: 260,
    y: 620,
    width: 760,
    height: 300,
    widgets: ["modelRouting", "resources"],
  },
  {
    id: "tools",
    title: "Sidebar Tools",
    mode: "docked",
    x: 1060,
    y: 620,
    width: 360,
    height: 300,
    widgets: [],
  },
  {
    id: "activity",
    title: "Activity & Monitoring",
    mode: "docked",
    x: 300,
    y: 940,
    width: 760,
    height: 240,
    widgets: ["activity"],
  },
]

function getWidget(id: WidgetId) {
  return widgets.find((widget) => widget.id === id) ?? widgets[0]
}

function getPanelTitle(panels: PanelState[], id: PanelId) {
  return panels.find((panel) => panel.id === id)?.title ?? id
}

function readStoredPanels(): PanelState[] {
  if (typeof window === "undefined") return defaultPanels
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultPanels
    const parsed = JSON.parse(stored) as PanelState[]
    const byId = new Map(parsed.map((panel) => [panel.id, panel]))
    return defaultPanels.map((panel) => ({ ...panel, ...byId.get(panel.id) }))
  } catch {
    return defaultPanels
  }
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

function AdaptiveBalanceControlWidget() {
  const [balance, setBalance] = useState<BalanceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setBalance(await getAdaptiveBalance())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adaptive Balance data failed to load.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <div className="rounded-md border border-amber-400/20 bg-amber-400/[0.04] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-amber-300" />
          <div>
            <h4 className="text-sm font-medium text-white">Adaptive Balance</h4>
            <p className="mt-0.5 text-xs text-slate-500">Live governance spectrum</p>
          </div>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="rounded p-1 text-slate-400 transition hover:bg-white/10 hover:text-amber-200 disabled:opacity-50"
          title="Refresh Adaptive Balance"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && (
        <div className="mt-4 space-y-2" aria-busy="true" aria-label="Loading Adaptive Balance">
          <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
          <div className="h-2 animate-pulse rounded bg-white/10" />
          <div className="h-2 w-4/5 animate-pulse rounded bg-white/10" />
        </div>
      )}

      {!loading && error && (
        <div className="mt-3 rounded border border-red-400/20 bg-red-500/10 p-2 text-xs text-red-200" role="alert">
          {error}
        </div>
      )}

      {!loading && balance && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded border border-white/10 bg-black/20 p-2">
              <p className="text-slate-500">Confidence</p>
              <p className="mt-1 text-amber-200">{formatPercent(balance.overallConfidence)}</p>
            </div>
            <div className="rounded border border-white/10 bg-black/20 p-2">
              <p className="text-slate-500">Dimensions</p>
              <p className="mt-1 text-cyan-200">{balance.dimensions.length}</p>
            </div>
          </div>
          <div className="space-y-2">
            {balance.dimensions.slice(0, 5).map((dimension) => (
              <div key={dimension.dimension}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-slate-300">{dimension.dimension}</span>
                  <span className="text-slate-500">{formatPercent(dimension.value)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-slate-800">
                  <div
                    className="h-full rounded bg-amber-300"
                    style={{ width: `${Math.max(0, Math.min(100, dimension.value * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Generated {new Date(balance.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      )}
    </div>
  )
}

function formatUsd(value: number) {
  return `$${value.toFixed(value > 0 && value < 0.01 ? 4 : 2)}`
}

function ModelRoutingControlWidget() {
  const [summary, setSummary] = useState<ModelRoutingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSummary(await getModelRoutingSummary())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Model routing data failed to load.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(refreshTimer)
  }, [refresh])

  const latestUsage = summary?.usageEvents[0]
  const latestRouting = summary?.routingEvents[0]
  const totalCost = summary?.usageEvents.reduce((total, event) => total + event.estimatedCostUsd, 0) ?? 0

  return (
    <div className="rounded-md border border-cyan-400/20 bg-cyan-400/[0.04] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-cyan-300" />
          <div>
            <h4 className="text-sm font-medium text-white">Model Routing & Cost</h4>
            <p className="mt-0.5 text-xs text-slate-500">Sluice + Docket telemetry loop</p>
          </div>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="rounded p-1 text-slate-400 transition hover:bg-white/10 hover:text-cyan-200 disabled:opacity-50"
          title="Refresh model routing telemetry"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && (
        <div className="mt-4 space-y-2" aria-busy="true" aria-label="Loading model routing telemetry">
          <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-2 animate-pulse rounded bg-white/10" />
          <div className="h-2 w-4/5 animate-pulse rounded bg-white/10" />
        </div>
      )}

      {!loading && error && (
        <div className="mt-3 rounded border border-red-400/20 bg-red-500/10 p-2 text-xs text-red-200" role="alert">
          {error}
        </div>
      )}

      {!loading && summary && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded border border-white/10 bg-black/20 p-2">
              <p className="text-slate-500">Sluice</p>
              <p className={summary.status.sluiceConfigured ? "mt-1 text-emerald-300" : "mt-1 text-amber-300"}>
                {summary.status.status}
              </p>
            </div>
            <div className="rounded border border-white/10 bg-black/20 p-2">
              <p className="text-slate-500">Docket</p>
              <p className="mt-1 text-cyan-200">{summary.status.docketMode}</p>
            </div>
            <div className="rounded border border-white/10 bg-black/20 p-2">
              <p className="text-slate-500">Route</p>
              <p className="mt-1 truncate text-slate-200">{summary.status.route}</p>
            </div>
            <div className="rounded border border-white/10 bg-black/20 p-2">
              <p className="text-slate-500">Cost</p>
              <p className="mt-1 text-amber-200">{formatUsd(totalCost)}</p>
            </div>
          </div>

          <div className="rounded border border-white/10 bg-black/20 p-2 text-xs">
            <p className="text-slate-500">Latest routing</p>
            <p className="mt-1 text-slate-300">{latestRouting?.message ?? "No routing event yet"}</p>
          </div>

          {latestUsage && (
            <div className="rounded border border-white/10 bg-black/20 p-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">Latest usage</span>
                <span className="text-slate-300">{latestUsage.totalTokens} tokens</span>
              </div>
              <p className="mt-1 truncate text-slate-400">
                {latestUsage.provider}/{latestUsage.model} - {latestUsage.policyOutcome}
              </p>
            </div>
          )}

          <p className="truncate text-[11px] text-slate-500">Correlation {summary.status.correlationId}</p>
        </div>
      )}
    </div>
  )
}

function WidgetCard({ id }: { id: WidgetId }) {
  if (id === "adaptiveBalance") {
    return <AdaptiveBalanceControlWidget />
  }

  if (id === "modelRouting") {
    return <ModelRoutingControlWidget />
  }

  const widget = getWidget(id)
  const Icon = widget.icon

  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${widget.color}`} />
        <h4 className="text-sm font-medium text-white">{widget.label}</h4>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-400">{widget.description}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded border border-white/10 bg-white/5 p-2">
          <p className="text-slate-500">State</p>
          <p className="mt-1 text-cyan-300">Preview</p>
        </div>
        <div className="rounded border border-white/10 bg-white/5 p-2">
          <p className="text-slate-500">Signal</p>
          <p className="mt-1 text-emerald-300">Linked</p>
        </div>
      </div>
    </div>
  )
}

function ControlPanel({
  panel,
  children,
  onFloat,
  onDock,
  onResize,
  onMove,
}: {
  panel: PanelState
  children: React.ReactNode
  onFloat: () => void
  onDock: () => void
  onResize: (width: number, height: number) => void
  onMove: (x: number, y: number) => void
}) {
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  const startMove = (event: React.MouseEvent) => {
    if (panel.mode !== "floating") return
    event.preventDefault()
    dragOffsetRef.current = {
      x: event.clientX - panel.x,
      y: event.clientY - panel.y,
    }

    const handleMove = (moveEvent: MouseEvent) => {
      onMove(moveEvent.clientX - dragOffsetRef.current.x, moveEvent.clientY - dragOffsetRef.current.y)
    }

    const handleUp = () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
    }

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
  }

  return (
    <section
      className={`rounded-lg border border-white/10 bg-slate-950/80 shadow-xl shadow-black/20 ${
        panel.mode === "floating" ? "fixed z-30 backdrop-blur-md" : "relative"
      }`}
      style={
        panel.mode === "floating"
          ? { left: panel.x, top: panel.y, width: panel.width, height: panel.height }
          : { minHeight: panel.height }
      }
    >
      <div
        className={`flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2 ${
          panel.mode === "floating" ? "cursor-move" : ""
        }`}
        onMouseDown={startMove}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-3.5 w-3.5 text-slate-500" />
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          <h3 className="text-sm font-semibold text-slate-200">{panel.title}</h3>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{panel.widgets.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onResize(Math.max(320, panel.width - 120), Math.max(180, panel.height - 80))
            }}
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-cyan-300"
            title="Shrink panel"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onResize(panel.width + 160, panel.height + 100)
            }}
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-cyan-300"
            title="Expand panel"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              panel.mode === "floating" ? onDock() : onFloat()
            }}
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-cyan-300"
            title={panel.mode === "floating" ? "Dock panel" : "Float panel"}
          >
            {panel.mode === "floating" ? <LayoutDashboard className="h-3.5 w-3.5" /> : <Move className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  )
}

export default function ControlPage() {
  const [panels, setPanels] = useState<PanelState[]>(defaultPanels)
  const [commandText, setCommandText] = useState("")
  const [commandContext, setCommandContext] = useState<CommandContext>("reasoning")
  const [commandStatus, setCommandStatus] = useState<"idle" | "pending" | "error">("idle")
  const [selectedPanelId, setSelectedPanelId] = useState<PanelId>("tools")
  const [commandLog, setCommandLog] = useState<string[]>([
    "Control interface online",
    "Command Center linked to mesh dashboard",
  ])

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => setPanels(readStoredPanels()), 0)
    return () => window.clearTimeout(restoreTimer)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(panels))
  }, [panels])

  const updatePanel = useCallback((id: PanelId, patch: Partial<PanelState>) => {
    setPanels((current) => current.map((panel) => (panel.id === id ? { ...panel, ...patch } : panel)))
  }, [])

  const widgetLocations = useMemo(() => {
    const locations = new Map<WidgetId, PanelId>()
    panels.forEach((panel) => {
      panel.widgets.forEach((widgetId) => locations.set(widgetId, panel.id))
    })
    return locations
  }, [panels])

  const placeWidget = useCallback((widgetId: WidgetId) => {
    const widget = getWidget(widgetId)
    setPanels((current) =>
      current.map((panel) => {
        const remainingWidgets = panel.widgets.filter((id) => id !== widgetId)
        if (panel.id !== selectedPanelId) return { ...panel, widgets: remainingWidgets }
        return { ...panel, widgets: [...remainingWidgets, widgetId] }
      }),
    )
    setCommandLog((current) => [`Placed ${widget.label} in ${getPanelTitle(panels, selectedPanelId)}`, ...current].slice(0, 6))
  }, [panels, selectedPanelId])

  const removeWidget = useCallback((widgetId: WidgetId) => {
    const widget = getWidget(widgetId)
    setPanels((current) =>
      current.map((panel) => ({
        ...panel,
        widgets: panel.widgets.filter((id) => id !== widgetId),
      })),
    )
    setCommandLog((current) => [`Removed ${widget.label} from layout`, ...current].slice(0, 6))
  }, [])

  const resetLayout = useCallback(() => {
    setPanels(defaultPanels)
    setSelectedPanelId("tools")
    setCommandStatus("idle")
    setCommandLog((current) => ["Layout reset to default", ...current].slice(0, 6))
  }, [])

  const submitCommand = useCallback(async () => {
    const text = commandText.trim()
    if (!text || commandStatus === "pending") return
    setCommandStatus("pending")
    setCommandText("")
    setCommandLog((current) => [`Routing ${commandContext}: ${text}`, ...current].slice(0, 6))

    try {
      const result = await executeCommandNexus({
        command: text,
        context: commandContext,
        tenantId: "command-nexus",
        userId: "operator",
      })
      setCommandStatus("idle")
      setCommandLog((current) => [
        `Completed ${result.model}: ${result.totalTokens} tokens, Docket ${result.docketStatus}, ${result.correlationId}`,
        result.response || "Command completed with no response text",
        ...current,
      ].slice(0, 6))
    } catch (error) {
      setCommandStatus("error")
      const message = error instanceof Error ? error.message : "Command execution failed"
      setCommandLog((current) => [`Command failed: ${message}`, ...current].slice(0, 6))
    }
  }, [commandContext, commandStatus, commandText])

  const renderedPanels = useMemo(
    () =>
      panels.map((panel) => (
        <ControlPanel
          key={panel.id}
          panel={panel}
          onFloat={() => updatePanel(panel.id, { mode: "floating" })}
          onDock={() => updatePanel(panel.id, { mode: "docked" })}
          onMove={(x, y) => updatePanel(panel.id, { x: Math.max(8, x), y: Math.max(8, y) })}
          onResize={(width, height) => updatePanel(panel.id, { width, height })}
        >
          {panel.widgets.length > 0 ? (
            panel.widgets.map((widgetId) => <WidgetCard key={widgetId} id={widgetId} />)
          ) : (
            <div className="col-span-full flex min-h-28 items-center justify-center rounded border border-dashed border-slate-700 text-sm text-slate-500">
              Add widgets from the library
            </div>
          )}
        </ControlPanel>
      )),
    [panels, updatePanel],
  )

  const dockedPanels = renderedPanels.filter((_, index) => panels[index].mode === "docked")
  const floatingPanels = renderedPanels.filter((_, index) => panels[index].mode === "floating")

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 shadow-2xl shadow-cyan-950/30">
      <div className="border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-md border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/20 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Mesh
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">Cognitive Mesh Command Center</h1>
              <p className="mt-1 text-xs text-slate-400">
                Fullscreen command surface for mesh operations, agents, signals, and diagnostics.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 p-1">
              {(["docked", "floating"] as PanelMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPanels((current) => current.map((panel) => ({ ...panel, mode })))}
                  className="rounded px-2 py-1 text-xs text-slate-300 transition hover:bg-cyan-500/20 hover:text-cyan-200"
                >
                  {mode === "docked" ? "Dock all" : "Float all"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={resetLayout}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Layout
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="relative min-h-[calc(100vh-8rem)] overflow-auto rounded-lg border border-white/10 bg-slate-950/60 p-4">
          <div className="mx-auto mb-6 max-w-2xl rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-r from-slate-900/95 to-indigo-950/80 p-4 shadow-2xl shadow-cyan-950/30">
            <div className="mb-3 flex flex-wrap gap-2">
              {(["agents", "reasoning", "analytics", "security"] as CommandContext[]).map((context) => (
                <button
                  key={context}
                  type="button"
                  onClick={() => setCommandContext(context)}
                  className={`rounded-md border px-2.5 py-1 text-xs capitalize transition ${
                    commandContext === context
                      ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-200"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {context}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commandText}
                onChange={(event) => setCommandText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    void submitCommand()
                  }
                }}
                placeholder={`Enter ${commandContext} command...`}
                className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                disabled
                className="rounded-lg bg-slate-700/50 p-2 text-slate-500"
                title="Voice input is not connected yet"
                aria-label="Voice input is not connected yet"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => void submitCommand()}
                disabled={!commandText.trim() || commandStatus === "pending"}
                className="rounded-lg bg-cyan-500/20 p-2 text-cyan-300 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                title="Queue command"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <span className={commandStatus === "pending" ? "text-amber-300" : commandStatus === "error" ? "text-rose-300" : "text-emerald-300"}>
                {commandStatus === "pending" ? "Executing through Sluice" : commandStatus === "error" ? "Needs attention" : "Ready"}
              </span>
              <span>Context: {commandContext}</span>
            </div>
          </div>

          <div className="space-y-4">{dockedPanels}</div>
          {floatingPanels}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <SlidersHorizontal className="h-4 w-4 text-purple-300" />
              Widget Library
            </div>
            <div className="mb-3 rounded-md border border-white/10 bg-black/20 p-2">
              <p className="mb-2 text-xs text-slate-500">Place selected widgets in</p>
              <div className="grid grid-cols-1 gap-1">
                {panels.map((panel) => (
                  <button
                    key={panel.id}
                    type="button"
                    onClick={() => setSelectedPanelId(panel.id)}
                    className={`flex items-center justify-between rounded px-2 py-1.5 text-left text-xs transition ${
                      selectedPanelId === panel.id
                        ? "bg-cyan-500/15 text-cyan-200"
                        : "text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{panel.title}</span>
                    <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-500">
                      {panel.widgets.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {widgets.map((widget) => {
                const Icon = widget.icon
                const currentPanelId = widgetLocations.get(widget.id)
                const currentPanelTitle = currentPanelId ? getPanelTitle(panels, currentPanelId) : "Not placed"
                const isInSelectedPanel = currentPanelId === selectedPanelId
                return (
                  <div
                    key={widget.id}
                    className={`rounded-md border bg-black/20 p-3 transition ${
                      isInSelectedPanel ? "border-cyan-500/40 bg-cyan-500/10" : "border-white/10 hover:border-cyan-500/30"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => placeWidget(widget.id)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <Icon className={`mt-0.5 h-4 w-4 ${widget.color}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-white">{widget.label}</span>
                        <span className="mt-1 block text-xs leading-4 text-slate-500">{widget.description}</span>
                      </span>
                    </button>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-2">
                      <span className="truncate text-[11px] text-slate-500">
                        {currentPanelId ? `In ${currentPanelTitle}` : "Not in layout"}
                      </span>
                      {currentPanelId && (
                        <button
                          type="button"
                          onClick={() => removeWidget(widget.id)}
                          className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-slate-400 transition hover:bg-red-500/10 hover:text-red-200"
                          title={`Remove ${widget.label}`}
                        >
                          <X className="h-3 w-3" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <Radio className="h-4 w-4 text-cyan-300" />
              Signals
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-white/10 bg-black/20 p-3">
                <p className="text-slate-500">Mesh Link</p>
                <p className="mt-1 text-cyan-300">Active</p>
              </div>
              <div className="rounded border border-white/10 bg-black/20 p-3">
                <p className="text-slate-500">Voice</p>
                <p className="mt-1 text-slate-300">Not connected</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <h2 className="mb-3 text-sm font-medium text-white">Command Log</h2>
            <div className="space-y-2">
              {commandLog.map((entry, index) => (
                <div key={`${entry}-${index}`} className="rounded border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300">
                  {entry}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <Square className="h-4 w-4 text-amber-300" />
              Layout
            </div>
            <p className="text-xs leading-5 text-slate-400">
              Select a destination panel in the Widget Library, then choose a widget to add or move it. Use each panel header to float, dock, expand, shrink, and drag floating panels.
              Layout is saved in this browser.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
