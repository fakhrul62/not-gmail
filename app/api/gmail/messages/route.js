import { withMailbox } from "../../../lib/gmail-api";
import { listParameters, mapConcurrent, normalizeMessage } from "../../../lib/mailbox.mjs";

export const runtime = "nodejs";

export async function GET(request) {
  return withMailbox(request, async api => {
    const query = listParameters(new URL(request.url).searchParams);
    const list = await api(`messages?${query}`);
    const messages = await mapConcurrent(list.messages || [], async ({ id }) => {
      try { return normalizeMessage(await api(`messages/${encodeURIComponent(id)}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject`)); }
      catch (error) { if (error.status === 404) return null; throw error; }
    });
    const labelIds = query.getAll("labelIds");
    const label = labelIds.length === 1 && !query.has("q") ? await api(`labels/${encodeURIComponent(labelIds[0])}`) : null;
    return { messages: messages.filter(Boolean), nextPageToken: list.nextPageToken || null,
      total: label?.messagesTotal ?? null, label: label ? { id: label.id, messagesTotal: label.messagesTotal, messagesUnread: label.messagesUnread } : null };
  });
}
