import test from "node:test";
import assert from "node:assert/strict";
import { listParameters, normalizeMessage, mapConcurrent, decodeHeader } from "../app/lib/mailbox.mjs";
import { encryptSession, decryptSession, canReadMailbox, READ_SCOPE, safeReturnPath } from "../app/lib/gmail.js";

test("Gmail pagination preserves opaque tokens and category intersections", () => {
  const result = listParameters(new URLSearchParams({ folder: "Inbox", category: "promotions", pageToken: "next/+==" }));
  assert.deepEqual(result.getAll("labelIds"), ["INBOX", "CATEGORY_PROMOTIONS"]);
  assert.equal(result.get("pageToken"), "next/+==");
  assert.equal(result.get("maxResults"), "25");
});
test("search runs across the mailbox rather than filtering the loaded inbox", () => {
  const result = listParameters(new URLSearchParams({ folder: "Inbox", category: "primary", q: "in:sent from:person@example.com" }));
  assert.deepEqual(result.getAll("labelIds"), []);
  assert.equal(result.get("q"), "in:sent from:person@example.com");
});
test("labels and folders are encoded and invalid folders fail", () => {
  assert.equal(listParameters(new URLSearchParams({ folder: "label:Label_42" })).get("labelIds"), "Label_42");
  assert.equal(listParameters(new URLSearchParams({ folder: "All mail" })).get("q"), "-in:spam -in:trash");
  assert.throws(() => listParameters(new URLSearchParams({ folder: "unknown" })));
});
test("nested MIME preserves actual body, nonnumeric IDs and attachment metadata", () => {
  const message = normalizeMessage({ id: "ab123f", labelIds: ["UNREAD", "STARRED"], internalDate: "1234", payload: {
    headers: [{ name: "From", value: '"A Person" <person@example.com>' }, { name: "Subject", value: "=?UTF-8?B?SGVsbG8g4pyT?=" }],
    mimeType: "multipart/mixed", parts: [
      { mimeType: "multipart/alternative", parts: [
        { mimeType: "text/plain", body: { data: Buffer.from("Hello ✓").toString("base64url") } },
        { mimeType: "text/html", body: { data: Buffer.from("<p>Hello ✓</p>").toString("base64url") } }
      ] },
      { partId: "1", filename: "notes.txt", mimeType: "text/plain", body: { data: Buffer.from("not body").toString("base64url"), size: 8 } }
    ]
  } });
  assert.equal(message.id, "ab123f"); assert.equal(message.email, "person@example.com");
  assert.equal(message.subject, "Hello ✓"); assert.equal(message.text, "Hello ✓"); assert.equal(message.html, "<p>Hello ✓</p>");
  assert.equal(message.unread, true); assert.equal(message.attachments[0].filename, "notes.txt");
  assert.equal(decodeHeader("=?ISO-8859-1?Q?Andr=E9?="), "André");
});
test("Google requests are bounded and result ordering is preserved", async () => {
  let active = 0, peak = 0;
  const result = await mapConcurrent([1, 2, 3, 4, 5], async item => {
    peak = Math.max(peak, ++active); await new Promise(resolve => setTimeout(resolve, 5)); active--; return item * 2;
  }, 2);
  assert.deepEqual(result, [2, 4, 6, 8, 10]); assert.equal(peak, 2);
});
test("send-only sessions require reconsent; encrypted sessions reject tampering", () => {
  process.env.SESSION_SECRET = "unit-test-only-session-key";
  assert.equal(canReadMailbox({ accessToken: "old", scope: "https://www.googleapis.com/auth/gmail.send" }), false);
  const session = { accessToken: "synthetic", scope: READ_SCOPE };
  const cookie = encryptSession(session);
  assert.deepEqual(decryptSession(cookie), session);
  const tampered = Buffer.from(cookie, "base64url"); tampered[15] ^= 1;
  assert.equal(decryptSession(tampered.toString("base64url")), null);
});
test("OAuth return paths cannot escape the application origin", () => {
  for (const value of ["//evil.example", "/\\evil.example", "/\tevil.example", "https://evil.example"]) assert.equal(safeReturnPath(value), "/");
  assert.equal(safeReturnPath("/?folder=inbox"), "/?folder=inbox");
});
