import { test, expect } from "@playwright/test";
import { encryptSession, READ_SCOPE, SEND_SCOPE } from "../../app/lib/gmail.js";

process.env.SESSION_SECRET = "browser-test-session-key";
async function connect(context, overrides = {}) {
  const value = encryptSession({ email: "reader@example.com", accessToken: "test-access", refreshToken: "test-refresh", scope: `${READ_SCOPE} ${SEND_SCOPE}`, expiresAt: Date.now() + 3600000, ...overrides });
  await context.addCookies([{ name: "not_gmail_session", value, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
}

test("disconnected and legacy connections never display sample mail", async ({ page, context, request }) => {
  const anonymous = await request.get("/api/gmail/messages");
  expect(anonymous.status()).toBe(401);
  expect(anonymous.headers()["cache-control"]).toContain("no-store");
  await page.goto("/");
  await expect(page.locator("#emptyState")).toContainText("Connect Gmail");
  await expect(page.locator(".message-row")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("0.82 GB");
  await connect(context, { scope: SEND_SCOPE });
  await page.reload();
  await expect(page.locator("#emptyState")).toContainText("Reconnect Gmail");
  const denied = await page.request.get("/api/gmail/messages");
  expect(denied.status()).toBe(403);
  expect((await denied.json()).authRequired).toBe(true);
});

test("real counts, labels, pagination, search and safe HTML rendering", async ({ page, context }) => {
  await connect(context);
  const errors = [], tracking = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (request.url().includes("tracking.example")) tracking.push(request.url()); });
  await page.goto("/");
  await expect(page.locator(".message-row")).toHaveCount(25);
  await expect(page.locator('[data-folder="Inbox"] .count')).toHaveText("7");
  await expect(page.locator("#rangeButton")).toHaveText("1–25 of 26");
  await expect(page.locator("#labelNav")).toContainText('<Work & "Projects">');
  await expect(page.locator(".mail-footer")).toContainText("234 messages");
  await page.locator("#nextPage").click();
  await expect(page.locator("#rangeButton")).toHaveText("26–26 of 26");
  await expect(page.locator("#nextPage")).toBeDisabled();
  await page.locator("#prevPage").click();
  await expect(page.locator(".message-row")).toHaveCount(25);
  await page.locator(".message-row").first().click();
  await expect(page.frameLocator('iframe[title="Email content"]').locator("h1")).toHaveText("Actual message body");
  expect(await page.locator("body").getAttribute("data-compromised")).toBeNull();
  expect(tracking).toEqual([]);
  await expect(page.locator(".real-attachments")).toContainText("report.txt");
  const attachment = await page.request.get("/api/gmail/messages/abc123?part=2");
  expect(await attachment.text()).toBe("downloaded attachment");
  expect(attachment.headers()["content-disposition"]).toContain("attachment;");
  await page.locator("#backButton").click();
  await page.locator("#searchInput").fill("from:sender@example.com");
  await page.locator("#searchInput").press("Enter");
  await expect(page.locator(".message-row")).toHaveCount(1);
  await expect(page.locator("#rangeButton")).toHaveText("1–1");
  await expect(page.locator("#rangeButton")).not.toContainText("999");
  expect(errors).toEqual([]);
  await page.screenshot({ path: "test-results/mailbox-desktop.png" });
});

test("empty and failed requests show actual states and refresh recovers", async ({ page, context }) => {
  await connect(context); await page.goto("/"); await expect(page.locator(".message-row")).toHaveCount(25);
  await page.locator("#searchInput").fill("empty"); await page.locator("#searchInput").press("Enter");
  await expect(page.locator("#emptyState")).toContainText("No messages");
  await page.locator("#searchInput").fill("rate-limit"); await page.locator("#searchInput").press("Enter");
  await expect(page.locator("#emptyState")).toContainText("Gmail is busy");
  await expect(page.locator(".message-row")).toHaveCount(0);
  await page.locator('[data-folder="Sent"]').click();
  await expect(page.locator(".message-row")).toHaveCount(1);
  await expect(page.locator(".sender")).toHaveText("reader@example.com");
});

test("OAuth requests read access, rejects partial grants, refreshes tokens", async ({ page, context }) => {
  const start = await page.request.get("/api/auth/google", { maxRedirects: 0 });
  expect(new URL(start.headers().location).searchParams.get("scope")).toContain(READ_SCOPE);
  const state = new URL(start.headers().location).searchParams.get("state");
  const callback = await page.request.get(`/api/auth/google/callback?state=${state}&code=send-only`, { maxRedirects: 0 });
  expect(callback.headers().location).toContain("missing-permission");
  expect((await context.cookies()).some(cookie => cookie.name === "not_gmail_session")).toBe(false);
  await connect(context, { expiresAt: 1 });
  const refreshed = await page.request.get("/api/gmail/mailbox");
  expect(refreshed.status()).toBe(200);
  expect(refreshed.headers()["set-cookie"]).toContain("not_gmail_session");
  expect(JSON.stringify(await refreshed.json())).not.toContain("test-access");
  await connect(context, { expiresAt: 1, refreshToken: "revoked" });
  const revoked = await page.request.get("/api/gmail/messages");
  expect(revoked.status()).toBe(401);
  expect((await revoked.json()).authRequired).toBe(true);
});

test("sending uses Gmail response, local drafts do not inflate Gmail counts, sign-out clears mailbox", async ({ page, context }) => {
  await connect(context); await page.goto("/"); await expect(page.locator(".message-row")).toHaveCount(25);
  await page.locator("#composeButton").click();
  await page.locator("#composeTo").fill("recipient@example.com");
  await page.locator("#composeSubject").fill("Test compose");
  await page.locator("#composeBody").fill("Test body");
  await page.locator("#closeCompose").click();
  await expect(page.locator("#toastText")).toContainText("on this device");
  await expect(page.locator('[data-folder="Drafts"] .count')).toHaveText("2");
  await page.reload();
  await expect(page.locator(".message-row")).toHaveCount(25);
  await expect(page.locator("#composeWindow")).not.toBeVisible();
  await page.locator("#composeButton").click();
  await expect(page.locator("#composeTo")).toHaveValue("recipient@example.com");
  await expect(page.locator("#composeSubject")).toHaveValue("Test compose");
  await expect(page.locator("#composeBody")).toHaveText("Test body");
  await page.locator("#sendButton").click();
  await expect(page.locator("#toastText")).toContainText("Message sent through Gmail");
  await page.locator("#profileButton").click(); await page.locator("#signOutButton").click();
  await expect(page.locator("#emptyState")).toContainText("Connect Gmail");
  await expect(page.locator(".message-row")).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("not-gmail-draft"))).toBeNull();
});

test("mobile mailbox fits the viewport", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await connect(context);
  await page.goto("/"); await expect(page.locator(".message-row")).toHaveCount(25);
  const surface = await page.locator("#mailSurface").boundingBox();
  expect(surface.x).toBeGreaterThanOrEqual(0); expect(surface.x + surface.width).toBeLessThanOrEqual(390);
  const avatar = await page.locator("#profileButton").boundingBox();
  await expect(page.locator(".connection-notice")).toHaveCount(0);
  expect(avatar.y).toBeGreaterThanOrEqual(0);
  await expect(page.locator("#nextPage")).toBeVisible();
  await expect(page.locator("#selectAll")).toBeVisible();
  await expect(page.locator("#moreButton")).toBeVisible();
  await page.locator("#moreButton").click();
  await expect(page.locator("#morePopover")).toBeVisible();
  const menu = await page.locator("#morePopover").boundingBox();
  expect(menu.x + menu.width).toBeLessThanOrEqual(390);
  await page.keyboard.press("Escape");
  await page.screenshot({ path: "test-results/mailbox-mobile.png" });
});

test("checkbox selection and More work without opening messages or leaking across pages", async ({ page, context }) => {
  await connect(context); await page.goto("/");
  await expect(page.locator(".message-row")).toHaveCount(25);
  await page.locator(".message-row input").first().check();
  await expect(page.locator("#selectionCount")).toHaveText("1 selected");
  await expect(page.locator("#messageView")).not.toHaveClass(/open/);
  expect(await page.locator("#selectAll").evaluate(input => input.indeterminate)).toBe(true);
  await page.locator("#selectAll").check();
  await expect(page.locator(".message-row.selected")).toHaveCount(25);
  await page.locator("#moreButton").click();
  await expect(page.locator("#morePopover")).toBeVisible();
  await page.locator('[data-more="clear"]').click();
  await expect(page.locator(".message-row.selected")).toHaveCount(0);
  await page.locator("#selectMenuButton").click();
  await page.locator('[data-select="unread"]').click();
  await expect(page.locator(".message-row.selected")).toHaveCount(25);
  await page.locator("#nextPage").click();
  await expect(page.locator(".message-row")).toHaveCount(1);
  await expect(page.locator(".message-row.selected")).toHaveCount(0);
  await page.locator("#moreButton").click();
  await page.locator('[data-more="unread"]').click();
  await expect(page.locator("#searchInput")).toHaveValue("is:unread");
  await expect(page.locator("#morePopover")).not.toBeVisible();
});
