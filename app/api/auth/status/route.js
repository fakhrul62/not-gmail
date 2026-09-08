import { gmailConfigured, readSession, canReadMailbox } from "../../../lib/gmail";

export const runtime = "nodejs";

export async function GET(request) {
  const session = gmailConfigured() ? readSession(request) : null;
  return Response.json({
    configured: gmailConfigured(),
    connected: Boolean(session?.refreshToken || session?.accessToken),
    canRead: canReadMailbox(session),
    email: session?.email || null
  }, { headers: { "Cache-Control": "no-store" } });
}
