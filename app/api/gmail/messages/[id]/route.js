import { NextResponse } from "next/server";
import { withMailbox } from "../../../../lib/gmail-api";
import { normalizeMessage, flattenParts, mapConcurrent } from "../../../../lib/mailbox.mjs";

export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  if (!/^[a-f0-9]+$/i.test(id)) return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });
  return withMailbox(request, async api => {
    const message = await api(`messages/${id}?format=full`);
    const parts = flattenParts(message.payload || {});
    const partId = new URL(request.url).searchParams.get("part");
    if (partId !== null) {
      const part = parts.find(p => p.partId === partId && p.filename);
      if (!part) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
      const body = part.body?.attachmentId ? await api(`messages/${id}/attachments/${encodeURIComponent(part.body.attachmentId)}`) : part.body;
      return new NextResponse(Buffer.from(body?.data || "", "base64url"), { headers: {
        "Content-Type": "application/octet-stream", "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(part.filename).replace(/'/g, "%27")}`
      } });
    }
    await mapConcurrent(parts.filter(p => !p.filename && /^text\/(plain|html)$/.test(p.mimeType) && p.body?.attachmentId), async part => {
      part.body = await api(`messages/${id}/attachments/${encodeURIComponent(part.body.attachmentId)}`);
    });
    return normalizeMessage(message);
  });
}
