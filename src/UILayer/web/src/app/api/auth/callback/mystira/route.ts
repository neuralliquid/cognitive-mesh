import { NextRequest, NextResponse } from "next/server"

const identityBaseUrl =
  process.env.MYSTIRA_IDENTITY_BASE_URL?.replace(/\/+$/, "") ?? "https://identity.mystira.app"
const clientId = process.env.MYSTIRA_OIDC_CLIENT_ID ?? "neuralliquid-cognitive-mesh-web"
const clientSecret = process.env.MYSTIRA_OIDC_CLIENT_SECRET

function sanitizeReturnTo(value: string | undefined): string {
  if (!value) return "/"
  const normalized = value.replace(/\\/g, "/")
  if (!normalized.startsWith("/") || normalized.startsWith("//") || normalized.includes("://")) {
    return "/"
  }
  return normalized
}

function htmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case "\"":
        return "&quot;"
      default:
        return "&#39;"
    }
  })
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
  const expectedState = request.cookies.get("cm_mystira_state")?.value
  const verifier = request.cookies.get("cm_mystira_verifier")?.value
  const returnTo = sanitizeReturnTo(request.cookies.get("cm_mystira_return_to")?.value)
  const state = request.nextUrl.searchParams.get("state")
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}&returnTo=${encodeURIComponent(returnTo)}`, origin))
  }

  if (!clientSecret || !expectedState || !verifier || !state || state !== expectedState || !code) {
    return NextResponse.redirect(new URL(`/login?error=mystira_callback_invalid&returnTo=${encodeURIComponent(returnTo)}`, origin))
  }

  const redirectUri = `${origin}/api/auth/callback/mystira`
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
    code_verifier: verifier,
  })

  const tokenResponse = await fetch(`${identityBaseUrl}/connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    cache: "no-store",
  })

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL(`/login?error=mystira_token_exchange_failed&returnTo=${encodeURIComponent(returnTo)}`, origin))
  }

  const tokenPayload = await tokenResponse.json()
  const accessToken = tokenPayload.access_token ?? tokenPayload.id_token
  const refreshToken = tokenPayload.refresh_token
  if (!accessToken) {
    return NextResponse.redirect(new URL(`/login?error=mystira_token_missing&returnTo=${encodeURIComponent(returnTo)}`, origin))
  }

  const secure = new URL(origin).protocol === "https:"
  const response = new NextResponse(
    `<!doctype html><html><body><script>
localStorage.setItem("cm_access_token", ${JSON.stringify(accessToken)});
${refreshToken ? `localStorage.setItem("cm_refresh_token", ${JSON.stringify(refreshToken)});` : ""}
document.cookie = "cm_access_token=${htmlEscape(accessToken)}; path=/; max-age=86400; SameSite=Lax${secure ? "; Secure" : ""}";
window.location.replace(${JSON.stringify(returnTo)});
</script></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  )
  response.cookies.delete("cm_mystira_state")
  response.cookies.delete("cm_mystira_verifier")
  response.cookies.delete("cm_mystira_return_to")
  return response
}
