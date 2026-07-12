"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { consumeReturnTo } from "@/lib/auth/mystiraIdentity"
import { MailCheck } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

function sanitizeReturnTo(value: string | null): string {
  if (!value) return "/"
  const normalized = value.replace(/\\/g, "/")
  if (!normalized.startsWith("/") || normalized.startsWith("//") || normalized.includes("://")) {
    return "/"
  }
  return normalized
}

function MagicVerifyForm() {
  const { completeMagicLink } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("Verifying your Mystira magic link...")
  const [error, setError] = useState("")

  const token = searchParams.get("token") ?? ""
  const returnTo = useMemo(() => sanitizeReturnTo(searchParams.get("returnTo") ?? consumeReturnTo()), [searchParams])

  useEffect(() => {
    if (!token) {
      setError("This magic link is missing its verification token.")
      setStatus("Magic link could not be verified")
      return
    }

    completeMagicLink(token)
      .then(() => {
        setStatus("Sign-in complete")
        router.replace(returnTo)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to complete magic-link sign-in")
        setStatus("Magic link could not be verified")
      })
  }, [completeMagicLink, router, returnTo, token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/80 p-8 text-center shadow-2xl backdrop-blur-sm">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-700/70 bg-cyan-950/40 text-cyan-200">
          <MailCheck aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-white">{status}</h1>
        <p className="mt-3 text-sm text-gray-400">
          This sign-in is powered by Mystira Identity.
        </p>
        {error && (
          <div className="mt-6 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MagicVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      }
    >
      <MagicVerifyForm />
    </Suspense>
  )
}
