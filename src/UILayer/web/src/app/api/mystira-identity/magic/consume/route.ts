import { NextRequest, NextResponse } from "next/server"

const identityApiBaseUrl =
  process.env.MYSTIRA_IDENTITY_API_BASE_URL?.replace(/\/+$/, "") ??
  process.env.NEXT_PUBLIC_MYSTIRA_IDENTITY_API_BASE_URL?.replace(/\/+$/, "") ??
  "https://identity.mystira.app"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const token = typeof body?.token === "string" ? body.token.trim() : ""

  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 })
  }

  const response = await fetch(`${identityApiBaseUrl}/api/auth/magic/consume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: request.nextUrl.origin,
    },
    body: JSON.stringify({ token }),
    cache: "no-store",
  })

  const payload = await response.json().catch(() => ({ message: "Mystira Identity request failed" }))
  return NextResponse.json(payload, { status: response.status })
}
