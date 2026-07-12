"use client"

import {
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
} from "@azure/msal-browser"

const RETURN_TO_KEY = "cm_auth_return_to"

const clientId = process.env.NEXT_PUBLIC_MYSTIRA_AUTH_CLIENT_ID
const tenantId = process.env.NEXT_PUBLIC_MYSTIRA_TENANT_ID
const authority =
  process.env.NEXT_PUBLIC_MYSTIRA_AUTHORITY ??
  (tenantId ? `https://login.microsoftonline.com/${tenantId}` : undefined)

const configuredScopes = process.env.NEXT_PUBLIC_MYSTIRA_AUTH_SCOPES
const scopes = configuredScopes
  ? configuredScopes.split(/[,\s]+/).filter(Boolean)
  : ["openid", "profile", "email"]

let instance: PublicClientApplication | null = null
let initialization: Promise<void> | null = null

export const isMystiraIdentityConfigured = Boolean(clientId && authority)

function getRedirectUri(): string {
  return `${window.location.origin}/login`
}

function getInstance(): PublicClientApplication {
  if (!clientId || !authority) {
    throw new Error("Mystira identity is not configured")
  }

  if (!instance) {
    instance = new PublicClientApplication({
      auth: {
        clientId,
        authority,
        redirectUri: getRedirectUri(),
        postLogoutRedirectUri: getRedirectUri(),
      },
      cache: {
        cacheLocation: "localStorage",
      },
    })
  }

  return instance
}

async function ensureInitialized() {
  const msal = getInstance()
  initialization ??= msal.initialize()
  await initialization
  return msal
}

function chooseAccount(msal: PublicClientApplication): AccountInfo | null {
  return msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? null
}

function rememberReturnTo(returnTo: string) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(RETURN_TO_KEY, returnTo)
}

export function consumeReturnTo(): string | null {
  if (typeof window === "undefined") return null
  const value = sessionStorage.getItem(RETURN_TO_KEY)
  if (value) {
    sessionStorage.removeItem(RETURN_TO_KEY)
  }
  return value
}

export async function signInWithMystira(returnTo: string) {
  if (!isMystiraIdentityConfigured) {
    throw new Error("Mystira identity is not configured")
  }

  rememberReturnTo(returnTo)
  const msal = await ensureInitialized()
  await msal.loginRedirect({
    scopes,
    redirectUri: getRedirectUri(),
  })
}

export async function completeMystiraRedirect(): Promise<string | null> {
  if (!isMystiraIdentityConfigured) return null

  const msal = await ensureInitialized()
  const redirectResult = await msal.handleRedirectPromise()
  if (redirectResult?.account) {
    msal.setActiveAccount(redirectResult.account)
    return redirectResult.idToken || redirectResult.accessToken || null
  }

  const account = chooseAccount(msal)
  if (!account) return null

  msal.setActiveAccount(account)
  const tokenResult: AuthenticationResult = await msal.acquireTokenSilent({
    account,
    scopes,
    redirectUri: getRedirectUri(),
  })
  return tokenResult.idToken || tokenResult.accessToken || null
}

export async function signOutOfMystira() {
  if (!isMystiraIdentityConfigured) return

  const msal = await ensureInitialized()
  const account = chooseAccount(msal)
  if (!account) return

  await msal.logoutRedirect({
    account,
    postLogoutRedirectUri: getRedirectUri(),
  })
}
