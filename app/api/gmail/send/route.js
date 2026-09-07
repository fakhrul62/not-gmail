import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  encryptSession,
  getAccessToken,
  gmailConfigured,
  readSession,
  sessionCookieOptions
} from "../../../lib/gmail";

export const runtime = "nodejs";

function validRecipients(value) {
  if (typeof value !== "string" || value.length > 2000) return false;
  const recipients = value.split(",").map(item => item.trim()).filter(Boolean);
  return recipients.length > 0 && recipients.length <= 50 && recipients.every(recipient =>
    /^[^\s<>@,]+@[^\s<>@,]+\.[^\s<>@,]+$/.test(recipient)
  );
}

function encodeMessage({ to, subject, body }) {
  const safeSubject = subject.replace(/[\r\n]+/g, " ");
  const encodedSubject = `=?UTF-8?B?${Buffer.from(safeSubject).toString("base64")}?=`;
  const encodedBody = Buffer.from(body || "", "utf8").toString("base64").match(/.{1,76}/g)?.join("\r\n") || "";
  const mime = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodedBody
  ].join("\r\n");
  return Buffer.from(mime).toString("base64url");
}

export async function POST(request) {
  if (!gmailConfigured()) {
    return Response.json({ error: "Gmail sending is not configured yet" }, { status: 503 });
  }

  const currentSession = readSession(request);
  if (!currentSession) {
    return Response.json({ error: "Connect your Google account before sending", authRequired: true }, { status: 401 });
  }

  let input;
  try { input = await request.json(); } catch { input = {}; }
  const to = typeof input.to === "string" ? input.to.trim() : "";
  const subject = typeof input.subject === "string" ? input.subject.trim().slice(0, 998) : "";
  const body = typeof input.body === "string" ? input.body.slice(0, 500_000) : "";
  if (!validRecipients(to)) {
    return Response.json({ error: "Enter a valid recipient email address" }, { status: 400 });
  }

  try {
    const { accessToken, session, refreshed } = await getAccessToken(currentSession);
    const gmailResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ raw: encodeMessage({ to, subject: subject || "(no subject)", body }) }),
      cache: "no-store"
    });
    const result = await gmailResponse.json();
    if (!gmailResponse.ok) {
      const message = result.error?.message || "Gmail could not send the message";
      const expired = gmailResponse.status === 401;
      return Response.json({ error: message, authRequired: expired }, { status: expired ? 401 : gmailResponse.status });
    }

    const response = NextResponse.json({ success: true, id: result.id, threadId: result.threadId });
    if (refreshed) response.cookies.set(SESSION_COOKIE, encryptSession(session), sessionCookieOptions());
    return response;
  } catch (error) {
    return Response.json({ error: error.message || "Message could not be sent", authRequired: true }, { status: 401 });
  }
}
