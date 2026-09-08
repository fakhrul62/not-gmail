import { NextResponse } from "next/server";
import { SESSION_COOKIE, gmailConfigured, readSession, canReadMailbox, getAccessToken, encryptSession, sessionCookieOptions } from "./gmail";

const json = (body, options = {}) => NextResponse.json(body, { ...options, headers: { "Cache-Control": "private, no-store" } });

export async function withMailbox(request, action) {
  let auth;
  try {
    if (!gmailConfigured()) return json({ error: "Gmail is not configured on this site." }, { status: 503 });
    const session = readSession(request);
    if (!session) return json({ error: "Connect Gmail to view your mailbox.", authRequired: true }, { status: 401 });
    if (!canReadMailbox(session)) return json({ error: "Reconnect Gmail and allow reading your messages.", authRequired: true }, { status: 403 });
    try { auth = await getAccessToken(session); }
    catch { return json({ error: "Your Google connection expired. Please reconnect.", authRequired: true }, { status: 401 }); }
    const api = async (path) => {
      const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }, cache: "no-store", signal: AbortSignal.timeout(20000)
      });
      const result = await response.json();
      if (!response.ok) {
        const reason = result.error?.errors?.[0]?.reason;
        const authRequired = response.status === 401 || reason === "insufficientPermissions";
        const error = response.status === 429 || reason === "rateLimitExceeded" || reason === "userRateLimitExceeded"
          ? "Gmail is busy. Wait a moment and refresh."
          : authRequired ? "Reconnect Gmail to renew mailbox access." : "Gmail could not load this data. Please try again.";
        throw Object.assign(new Error(error), { status: response.status, authRequired });
      }
      return result;
    };
    const result = await action(api);
    const response = result instanceof Response ? result : NextResponse.json(result);
    response.headers.set("Cache-Control", "private, no-store");
    if (auth.refreshed) response.cookies.set(SESSION_COOKIE, encryptSession(auth.session), sessionCookieOptions());
    return response;
  } catch (error) {
    const response = NextResponse.json({ error: error.status ? error.message : "Could not reach Gmail. Please try again.", authRequired: Boolean(error.authRequired) }, { status: error.status || 502 });
    response.headers.set("Cache-Control", "private, no-store");
    if (auth?.refreshed) response.cookies.set(SESSION_COOKIE, encryptSession(auth.session), sessionCookieOptions());
    return response;
  }
}
