"use client"

import Link from "next/link"
import { useEffect } from "react"
import { ArrowUpRight, PanelTop } from "lucide-react"
import { useDashboardStore } from "@/stores"
import { SkeletonDashboard } from "@/components/Skeleton"

export default function DashboardPage() {
  const { layers, metrics, systemStatus, loading, error, lastFailures, fetchAll } =
    useDashboardStore()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  if (loading && layers.length === 0) {
    return <SkeletonDashboard />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">Mesh status, governance surfaces, and live system signals.</p>
        </div>
        <Link
          href="/control"
          className="inline-flex w-fit items-center gap-3 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20 hover:text-white"
        >
          <PanelTop className="h-4 w-4" />
          Launch Command Center
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-amber-300">{error}</p>
              {lastFailures.length > 0 && (
                <div className="mt-2 space-y-1 text-xs text-amber-100/80">
                  {lastFailures.map((failure) => (
                    <p key={`${failure.endpoint}-${failure.correlationId}`}>
                      {failure.endpoint}
                      {failure.status ? ` returned ${failure.status}` : ""}
                      {" "}
                      ({failure.elapsedMs}ms, correlation {failure.correlationId})
                    </p>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={fetchAll}
              className="rounded bg-cyan-600 px-4 py-1.5 text-sm text-white hover:bg-cyan-500"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Metrics row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xs text-gray-400">{m.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{m.value}</p>
            <p
              className={`mt-1 text-xs ${
                m.status === "up"
                  ? "text-green-400"
                  : m.status === "down"
                    ? "text-red-400"
                    : "text-gray-400"
              }`}
            >
              {m.change}
            </p>
          </div>
        ))}
      </div>

      {/* Layers */}
      {layers.length === 0 && !loading && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-gray-500">
          No layers available
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className="rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{layer.name}</h3>
              <span className="text-xs text-cyan-400">
                {typeof layer.uptime === 'number' ? layer.uptime.toFixed(1) : '\u2014'}% uptime
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-400">{layer.description}</p>
          </div>
        ))}
      </div>

      {/* System status */}
      {systemStatus && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">
            System Status
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <p className="text-gray-400">Power</p>
              <p className="text-white">{systemStatus.power}%</p>
            </div>
            <div>
              <p className="text-gray-400">Load</p>
              <p className="text-white">{systemStatus.load}%</p>
            </div>
            <div>
              <p className="text-gray-400">Neural Network</p>
              <p className={systemStatus.neuralNetwork ? "text-green-400" : "text-red-400"}>
                {systemStatus.neuralNetwork ? "Online" : "Offline"}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Quantum Processing</p>
              <p className={systemStatus.quantumProcessing ? "text-green-400" : "text-red-400"}>
                {systemStatus.quantumProcessing ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
