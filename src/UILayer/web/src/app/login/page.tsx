"use client"

import { FormEvent, Suspense } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { consumeReturnTo, isMystiraIdentityConfigured } from "@/lib/auth/mystiraIdentity"
import { KeyRound, Mail } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

function sanitizeReturnTo(value: string | null): string {
  if (!value) return "/"
  // Normalize backslashes to forward slashes to prevent open redirects (e.g. /\evil.com)
  const normalized = value.replace(/\\/g, "/")
  if (!normalized.startsWith("/") || normalized.startsWith("//") || normalized.includes("://")) {
    return "/"
  }
  return normalized
}

function LoginForm() {
  const { loginWithMystira, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [email, setEmail] = useState("")
  const [submittingProvider, setSubmittingProvider] = useState<"entra" | "magic" | null>(null)

  const returnTo = useMemo(() => {
    return sanitizeReturnTo(searchParams.get("returnTo") ?? consumeReturnTo())
  }, [searchParams])

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(returnTo)
    }
  }, [isAuthenticated, isLoading, router, returnTo])

  function handleEntraClick() {
    if (!isMystiraIdentityConfigured) {
      setError("Mystira identity is not configured for this deployment")
      return
    }
    setError("")
    setNotice("")
    setSubmittingProvider("entra")
    loginWithMystira(returnTo).catch((err) => {
      setError(err instanceof Error ? err.message : "Login failed")
      setSubmittingProvider(null)
    })
  }

  function handleMagicSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Enter a valid email address")
      return
    }

    setError("")
    setNotice("")
    setSubmittingProvider("magic")
    const startUrl = new URL("/api/auth/mystira/start", window.location.origin)
    startUrl.searchParams.set("returnTo", returnTo)
    startUrl.searchParams.set("login_hint", trimmedEmail)
    window.location.href = startUrl.toString()
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Cognitive Mesh</h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in with Mystira Workspace identity
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
              {notice}
            </div>
          )}

          <button
            type="button"
            onClick={handleEntraClick}
            disabled={submittingProvider !== null}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-cyan-600 px-4 py-3 font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <KeyRound aria-hidden="true" className="h-4 w-4" />
            {submittingProvider === "entra" ? "Opening Microsoft Entra..." : "Continue with Microsoft Entra"}
          </button>

          <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-wider text-gray-500">
            <span className="h-px flex-1 bg-gray-800" />
            <span>or</span>
            <span className="h-px flex-1 bg-gray-800" />
          </div>

          <form onSubmit={handleMagicSubmit} className="space-y-3">
            <label className="sr-only" htmlFor="magic-email">
              Email address
            </label>
            <input
              id="magic-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              disabled={submittingProvider !== null}
              className="w-full rounded-lg border border-gray-700 bg-gray-950/60 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={submittingProvider !== null}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-cyan-700/70 bg-gray-950/40 px-4 py-3 font-medium text-cyan-100 transition hover:border-cyan-500 hover:bg-cyan-950/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
              {submittingProvider === "magic" ? "Opening Mystira Identity..." : "Continue with Mystira magic link"}
            </button>
          </form>
        </div>

        <div className="mt-8 space-y-2 border-t border-gray-800 pt-6 text-center text-xs leading-5 text-gray-500">
          <p>
            Developed by{" "}
            <a
              href="https://neuralliquid.ai"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-300 transition hover:text-cyan-200"
            >
              NeuralLiquid.ai
            </a>
          </p>
          <p>
            In partnership with{" "}
            <a
              href="https://www.phoenixvc.tech"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-300 transition hover:text-cyan-200"
            >
              PhoenixVC
            </a>{" "}
            and{" "}
            <a
              href="https://www.mystira.app"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-300 transition hover:text-cyan-200"
            >
              Mystira
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
