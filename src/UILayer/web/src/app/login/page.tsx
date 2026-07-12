"use client"

import { Suspense } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

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
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"))

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(returnTo)
    }
  }, [isAuthenticated, isLoading, router, returnTo])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await login(email, password)
      router.replace(returnTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setSubmitting(false)
    }
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Sign in with Mystira"}
          </button>
        </form>

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
