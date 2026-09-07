import { NextResponse } from "next/server";
import {
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  callbackUrl,
  encryptSession,
  gmailConfigured,
  safeReturnPath,
  sessionCookieOptions
} from "../../../../lib/gmail";

export const runtime = "nodejs";

function redirectWithStatus(request, status, returnTo = "/") {
  const url = new URL(safeReturnPath(returnTo), request.url);
  url.searchParams.set("gmail", status);
  return NextResponse.redirect(url);
}

export async function GET(request) {
  if (!gmailConfigured()) return redirectWithStatus(request, "not-configured");

  const url = new URL(request.url);
  const storedValue = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  let stored;
  try { stored = JSON.parse(storedValue || "null"); } catch { stored = null; }

  if (!stored?.state || stored.state !== url.searchParams.get("state")) {
    return redirectWithStatus(request, "invalid-state", stored?.returnTo);
  }
  if (url.searchParams.get("error")) {
    return redirectWithStatus(request, "denied", stored.returnTo);
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: url.searchParams.get("code") || "",
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: callbackUrl(request),
      grant_type: "authorization_code"
    }),
    cache: "no-store"
  });
  const tokens = await tokenResponse.json();
  if (!tokenResponse.ok || !tokens.access_token) {
    return redirectWithStatus(request, "token-error", stored.returnTo);
  }

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    cache: "no-store"
  });
  const profile = profileResponse.ok ? await profileResponse.json() : {};
  const session = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
    email: profile.email || "Google account"
  };

  const response = redirectWithStatus(request, "connected", stored.returnTo);
  response.cookies.set(SESSION_COOKIE, encryptSession(session), sessionCookieOptions());
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}
