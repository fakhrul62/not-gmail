import crypto from "node:crypto";

export const SESSION_COOKIE = "not_gmail_session";
export const OAUTH_STATE_COOKIE = "not_gmail_oauth_state";
export const READ_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
export const SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
export const GOOGLE_SCOPES = `openid email ${READ_SCOPE} ${SEND_SCOPE}`;

export function canReadMailbox(session) {
  return Boolean(session?.scope?.split(" ").includes(READ_SCOPE));
}

export function gmailConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.SESSION_SECRET
  );
}

export function callbackUrl(request) {
  return process.env.GOOGLE_REDIRECT_URI || new URL("/api/auth/google/callback", request.url).toString();
}

function encryptionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSession(session) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptSession(value) {
  try {
    if (!value) return null;
    const packed = Buffer.from(value, "base64url");
    const iv = packed.subarray(0, 12);
    const tag = packed.subarray(12, 28);
    const encrypted = packed.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8"));
  } catch {
    return null;
  }
}

export function readSession(request) {
  return decryptSession(request.cookies.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}

export async function getAccessToken(session) {
  if (session.accessToken && Date.now() < (session.expiresAt || 0) - 60_000) {
    return { accessToken: session.accessToken, session, refreshed: false };
  }

  if (!session.refreshToken) throw new Error("Google authorization has expired");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: session.refreshToken,
      grant_type: "refresh_token"
    }),
    cache: "no-store"
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) {
    throw new Error(result.error_description || "Could not refresh Google authorization");
  }

  const updatedSession = {
    ...session,
    accessToken: result.access_token,
    expiresAt: Date.now() + (result.expires_in || 3600) * 1000
  };
  return { accessToken: result.access_token, session: updatedSession, refreshed: true };
}

export function safeReturnPath(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !/[\\\r\n\t]/.test(value)
    ? value
    : "/";
}
