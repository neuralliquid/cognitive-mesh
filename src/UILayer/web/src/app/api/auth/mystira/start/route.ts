import { randomBytes, createHash } from "crypto"
import { NextRequest, NextResponse } from "next/server"

const identityBaseUrl =
  process.env.MYSTIRA_IDENTITY_BASE_URL?.replace(/\/+$/, "") ?? "https://identity.mystira.app"
const clientId = process.env.MYSTIRA_OIDC_CLIENT_ID ?? "neuralliquid-cognitive-mesh-web"
const scope = "openid profile email offline_access"

function base64Url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function sanitizeReturnTo(value: string | null): string {
  if (!value) return "/"
  const normalized = value.replace(/\\/g, "/")
  if (!normalized.startsWith("/") || normalized.startsWith("//") || normalized.includes("://")) {
    return "/"
  }
  return normalized
}

function getPublicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto")
  const host = forwardedHost ?? request.headers.get("host")
  if (host) {
    return `${forwardedProto ?? request.nextUrl.protocol.replace(":", "")}://${host}`
  }
  return request.nextUrl.origin
}

export async function GET(request: NextRequest) {
  const origin = getPublicOrigin(request)
  const redirectUri = `${origin}/api/auth/callback/mystira`
  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("returnTo"))
  const loginHint = request.nextUrl.searchParams.get("login_hint")
  const state = base64Url(randomBytes(32))
  const nonce = base64Url(randomBytes(32))
  const verifier = base64Url(randomBytes(48))
  const challenge = base64Url(createHash("sha256").update(verifier).digest())

  const authorizeUrl = new URL(`${identityBaseUrl}/connect/authorize`)
  authorizeUrl.searchParams.set("client_id", clientId)
  authorizeUrl.searchParams.set("response_type", "code")
  authorizeUrl.searchParams.set("redirect_uri", redirectUri)
  authorizeUrl.searchParams.set("scope", scope)
  authorizeUrl.searchParams.set("state", state)
  authorizeUrl.searchParams.set("nonce", nonce)
  authorizeUrl.searchParams.set("code_challenge", challenge)
  authorizeUrl.searchParams.set("code_challenge_method", "S256")
  if (loginHint) {
    authorizeUrl.searchParams.set("login_hint", loginHint)
  }

  const response = NextResponse.redirect(authorizeUrl)
  const secure = new URL(origin).protocol === "https:"
  response.cookies.set("cm_mystira_state", state, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 600 })
  response.cookies.set("cm_mystira_verifier", verifier, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 600 })
  response.cookies.set("cm_mystira_return_to", returnTo, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 600 })
  return response
}
