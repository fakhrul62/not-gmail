export const FOLDER_LABELS = {
  Inbox: "INBOX", Starred: "STARRED", Important: "IMPORTANT", Sent: "SENT",
  Drafts: "DRAFT", Spam: "SPAM", Trash: "TRASH"
};

export function listParameters(input) {
  const params = new URLSearchParams({ maxResults: "25", includeSpamTrash: "true" });
  const folder = input.get("folder") || "Inbox";
  const query = (input.get("q") || "").slice(0, 2000);
  if (query) params.set("q", query);
  else if (folder === "All mail") params.set("q", "-in:spam -in:trash");
  else if (folder.startsWith("label:")) params.append("labelIds", folder.slice(6));
  else if (FOLDER_LABELS[folder]) params.append("labelIds", FOLDER_LABELS[folder]);
  else throw Object.assign(new Error("Unknown mailbox folder"), { status: 400 });
  const category = input.get("category");
  if (!query && folder === "Inbox" && category && category !== "all") {
    const categoryLabels = { primary: "CATEGORY_PERSONAL", promotions: "CATEGORY_PROMOTIONS", social: "CATEGORY_SOCIAL", updates: "CATEGORY_UPDATES", forums: "CATEGORY_FORUMS" };
    if (!categoryLabels[category]) throw Object.assign(new Error("Unknown category"), { status: 400 });
    params.append("labelIds", categoryLabels[category]);
  }
  const pageToken = input.get("pageToken");
  if (pageToken) params.set("pageToken", pageToken.slice(0, 2048));
  return params;
}

export async function mapConcurrent(items, mapper, concurrency = 5) {
  const output = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await mapper(items[index]);
    }
  }));
  return output;
}

function decodeText(part) {
  const bytes = Buffer.from(part.body?.data || "", "base64url");
  const contentType = part.headers?.find(h => h.name.toLowerCase() === "content-type")?.value || "";
  const charset = contentType.match(/charset=["']?([^;\s"']+)/i)?.[1] || "utf-8";
  try { return new TextDecoder(charset).decode(bytes); } catch { return bytes.toString("utf8"); }
}

export function decodeHeader(value) {
  return value.replace(/(\?=)\s+(=\?)/g, "$1$2").replace(/=\?([^?]+)\?([bq])\?([^?]*)\?=/gi, (original, charset, encoding, encoded) => {
    try {
      const bytes = encoding.toLowerCase() === "b" ? Buffer.from(encoded, "base64") : Buffer.from(encoded.replace(/_/g, " ").replace(/=([a-f0-9]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))), "latin1");
      return new TextDecoder(charset).decode(bytes);
    } catch { return original; }
  });
}

export function flattenParts(payload) {
  return [payload, ...(payload.parts || []).flatMap(flattenParts)];
}

export function normalizeMessage(message) {
  const payload = message.payload || {};
  const header = name => decodeHeader(payload.headers?.find(h => h.name.toLowerCase() === name)?.value || "");
  const from = header("from");
  const address = from.match(/^(.*?)\s*<([^>]+)>$/);
  const parts = flattenParts(payload);
  const textParts = parts.filter(p => !p.filename && p.mimeType === "text/plain");
  const htmlParts = parts.filter(p => !p.filename && p.mimeType === "text/html");
  return {
    id: message.id, threadId: message.threadId,
    sender: address ? address[1].replace(/^"|"$/g, "").trim() || address[2] : from,
    email: address ? address[2] : from, to: header("to"), cc: header("cc"), replyTo: header("reply-to"),
    subject: header("subject") || "(no subject)", snippet: message.snippet || "",
    timestamp: Number(message.internalDate) || null,
    unread: (message.labelIds || []).includes("UNREAD"),
    starred: (message.labelIds || []).includes("STARRED"), labels: message.labelIds || [],
    text: textParts.map(decodeText).join("\n"), html: htmlParts.map(decodeText).join("\n"),
    attachments: parts.filter(p => p.filename).map(p => ({
      filename: p.filename, partId: p.partId, size: p.body?.size || 0
    }))
  };
}
