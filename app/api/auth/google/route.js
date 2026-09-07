import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  OAUTH_STATE_COOKIE,
  callbackUrl,
  gmailConfigured,
  safeReturnPath
} from "../../../lib/gmail";

export const runtime = "nodejs";

export async function GET(request) {
  if (!gmailConfigured()) {
    return NextResponse.redirect(new URL("/?gmail=not-configured", request.url));
  }

  const state = crypto.randomBytes(32).toString("base64url");
  const returnTo = safeReturnPath(new URL(request.url).searchParams.get("returnTo"));
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: callbackUrl(request),
    response_type: "code",
    scope: "openid email https://www.googleapis.com/auth/gmail.send",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state
  }).toString();

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, JSON.stringify({ state, returnTo }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600
  });
  return response;
}
