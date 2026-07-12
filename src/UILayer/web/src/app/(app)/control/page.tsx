"use client"

import Link from "next/link"
import { useCallback, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import Nexus from "@/components/Nexus"
import { DragDropProvider } from "@/contexts/DragDropContext"
import { ArrowLeft, Maximize2, Move, Radio, RotateCcw, SlidersHorizontal } from "lucide-react"

type DockHandleStyle = "grip" | "anchor" | "titlebar" | "ring" | "invisible"

const handleStyles: { value: DockHandleStyle; label: string }[] = [
  { value: "grip", label: "Grip" },
  { value: "anchor", label: "Anchor" },
  { value: "titlebar", label: "Titlebar" },
  { value: "ring", label: "Ring" },
  { value: "invisible", label: "Clean" },
]

export default function ControlPage() {
  const [dockHandleStyle, setDockHandleStyle] = useState<DockHandleStyle>("grip")
  const [commandLog, setCommandLog] = useState<string[]>([
    "Control interface online",
    "Command Nexus linked to mesh dashboard",
  ])
  const [voiceActive, setVoiceActive] = useState(false)

  const handlePromptSubmit = useCallback((prompt: string) => {
    setCommandLog((current) => [`Executed: ${prompt}`, ...current].slice(0, 6))
  }, [])

  return (
    <DragDropProvider>
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
                <h1 className="text-lg font-semibold text-white">CogMesh Control</h1>
                <p className="mt-1 text-xs text-slate-400">
                  Immersive command surface for dockable controls, agent operations, and mesh inspection.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 p-1">
                {handleStyles.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setDockHandleStyle(style.value)}
                    className={`rounded px-2 py-1 text-xs transition ${
                      dockHandleStyle === style.value
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                    aria-pressed={dockHandleStyle === style.value}
                  >
                    {style.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCommandLog(["Layout reset requested", ...commandLog].slice(0, 6))}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="relative min-h-[calc(100vh-8rem)] overflow-auto rounded-lg border border-white/10 bg-slate-950/60 p-4">
            <Nexus
              mode="command"
              isVoiceActive={voiceActive}
              onVoiceToggle={() => setVoiceActive((active) => !active)}
              onPromptSubmit={handlePromptSubmit}
              enableAudio={false}
            />

            <div className="pointer-events-none absolute right-4 top-4 z-10 flex gap-2 text-xs text-cyan-300">
              <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-1">command nexus</span>
              <span className="rounded border border-purple-500/20 bg-purple-500/10 px-2 py-1">dock grid</span>
            </div>

            <DashboardLayout dockHandleStyle={dockHandleStyle} />
          </div>

          <aside className="space-y-4">
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
                  <p className={voiceActive ? "mt-1 text-emerald-300" : "mt-1 text-slate-300"}>
                    {voiceActive ? "Listening" : "Standby"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                <SlidersHorizontal className="h-4 w-4 text-purple-300" />
                Dock Controls
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Move className="h-3.5 w-3.5 text-slate-500" />
                  Drag modules into available zones
                </div>
                <div className="flex items-center gap-2">
                  <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
                  Resize panels from their controls
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
          </aside>
        </div>
      </div>
    </DragDropProvider>
  )
}
