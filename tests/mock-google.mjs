// Loaded only by the isolated test server. All Google traffic is synthetic.
const originalFetch = globalThis.fetch;
const scope = "openid email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send";
const headers = [{ name: "From", value: "Real Sender <sender@example.com>" }, { name: "To", value: "reader@example.com" }, { name: "Subject", value: "Mailbox fixture" }];
const json = (value, status = 200) => Response.json(value, { status });
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  if (url.hostname === "oauth2.googleapis.com") {
    const body = new URLSearchParams(options.body);
    if (body.get("refresh_token") === "revoked") return json({ error: "invalid_grant" }, 400);
    return json({ access_token: "test-access", refresh_token: "test-refresh", expires_in: 3600, scope: body.get("code") === "send-only" ? "openid email https://www.googleapis.com/auth/gmail.send" : scope });
  }
  if (url.hostname === "openidconnect.googleapis.com") return json({ email: "reader@example.com" });
  if (url.hostname !== "gmail.googleapis.com") return originalFetch(input, options);
  const route = url.pathname.replace("/gmail/v1/users/me/", "");
  const authorization = new Headers(options.headers).get("Authorization");
  if (authorization !== "Bearer test-access") return json({ error: { errors: [{ reason: "authError" }] } }, 401);
  const labels = ["INBOX", "STARRED", "IMPORTANT", "SENT", "DRAFT", "SPAM", "TRASH"].map(id => ({ id, name: id, type: "system", messagesTotal: id === "INBOX" ? 26 : 2, messagesUnread: id === "INBOX" ? 7 : 0 }));
  labels.push({ id: "Label_1", name: '<Work & "Projects">', type: "user", messagesTotal: 2, messagesUnread: 1 });
  if (route === "profile") return json({ emailAddress: "reader@example.com", messagesTotal: 234, threadsTotal: 190 });
  if (route === "labels") return json({ labels: labels.map(({ id, name, type }) => ({ id, name, type })) });
  if (route.startsWith("labels/")) return json(labels.find(label => label.id === decodeURIComponent(route.slice(7))) || {});
  if (route === "messages") {
    if (url.searchParams.get("q") === "rate-limit") return json({ error: { errors: [{ reason: "rateLimitExceeded" }] } }, 429);
    if (url.searchParams.get("q") === "empty") return json({ resultSizeEstimate: 0 });
    if (url.searchParams.get("pageToken") === "older") return json({ messages: [{ id: "ff26" }], resultSizeEstimate: 999 });
    if (url.searchParams.has("q") || url.searchParams.get("labelIds") !== "INBOX") return json({ messages: [{ id: "abc123" }], resultSizeEstimate: 999 });
    return json({ messages: Array.from({ length: 25 }, (_, i) => ({ id: (0xabc123 + i).toString(16) })), nextPageToken: "older", resultSizeEstimate: 999 });
  }
  if (route.endsWith("/attachments/file")) return json({ data: Buffer.from("downloaded attachment").toString("base64url"), size: 21 });
  if (route.startsWith("messages/") && !route.endsWith("/send")) {
    const id = route.split("/")[1];
    return json({ id, threadId: "abc999", labelIds: ["INBOX", "UNREAD", "STARRED"], internalDate: "1788825600000", snippet: "Actual &amp; escaped snippet", payload: { headers, mimeType: "multipart/mixed", parts: [
      { mimeType: "text/plain", body: { data: Buffer.from("Actual message body").toString("base64url") } },
      { mimeType: "text/html", body: { data: Buffer.from('<h1>Actual message body</h1><script>parent.document.body.dataset.compromised="yes"</script><img src="https://tracking.example/pixel" onerror="alert(1)">').toString("base64url") } },
      { partId: "2", filename: "report.txt", mimeType: "text/plain", body: { attachmentId: "file", size: 21 } }
    ] } });
  }
  if (route === "messages/send") return json({ id: "sent123", threadId: "sent123" });
  throw new Error(`Unexpected Google test request: ${url.pathname}`);
};
