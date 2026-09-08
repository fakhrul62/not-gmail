import { NextResponse } from "next/server";
import { withMailbox } from "../../../lib/gmail-api";
import { listParameters } from "../../../lib/mailbox.mjs";

export const runtime = "nodejs";

export async function POST(request) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || !request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "Invalid request origin or content type." }, { status: 403 });
  }
  let input;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!input || typeof input !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  return withMailbox(request, async api => {
    let ids, hasMore = false;
    if (input.ids !== undefined) {
      if (!Array.isArray(input.ids) || !input.ids.length || input.ids.length > 1000 || !input.ids.every(id => typeof id === "string" && /^[a-f0-9]{1,64}$/i.test(id))) {
        return NextResponse.json({ error: "Select valid messages to mark as read." }, { status: 400 });
      }
      ids = [...new Set(input.ids)];
    } else {
      if (![input.folder, input.category, input.q].every(value => value === undefined || typeof value === "string")) return NextResponse.json({ error: "Invalid mailbox view." }, { status: 400 });
      const query = listParameters(new URLSearchParams({ folder: input.folder || "Inbox", category: input.category || "all", q: input.q || "" }));
      query.set("maxResults", "500");
      query.append("labelIds", "UNREAD");
      // Fetch the first unread batch again after each mutation: page offsets shift
      // when UNREAD is removed, so reusing list page tokens can skip messages.
      const list = await api(`messages?${query}`);
      ids = (list.messages || []).map(message => message.id);
      hasMore = Boolean(list.nextPageToken);
    }
    if (ids.length) await api("messages/batchModify", { method: "POST", body: JSON.stringify({ ids, removeLabelIds: ["UNREAD"] }) });
    return { success: true, processed: ids.length, hasMore: ids.length > 0 && hasMore };
  }, { modify: true });
}
