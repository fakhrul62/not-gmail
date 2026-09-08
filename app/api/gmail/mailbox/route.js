import { withMailbox } from "../../../lib/gmail-api";
import { mapConcurrent, FOLDER_LABELS } from "../../../lib/mailbox.mjs";

export const runtime = "nodejs";

export async function GET(request) {
  return withMailbox(request, async api => {
    const [profile, list] = await Promise.all([api("profile"), api("labels")]);
    const countedIds = new Set(Object.values(FOLDER_LABELS));
    const details = await mapConcurrent((list.labels || []).filter(label => countedIds.has(label.id)), label => api(`labels/${encodeURIComponent(label.id)}`));
    const labels = (list.labels || []).map(label => details.find(detail => detail.id === label.id) || label);
    return { email: profile.emailAddress, messagesTotal: profile.messagesTotal, threadsTotal: profile.threadsTotal,
      labels: labels.map(label => ({ id: label.id, name: label.name, type: label.type,
        messagesTotal: label.messagesTotal, messagesUnread: label.messagesUnread,
        color: label.color?.backgroundColor || "#1a73e8" })) };
  });
}
