# Not Gmail

A Next.js Gmail client with real messages, folder counts, labels, server-side search, pagination, message bodies, attachment downloads, and sending. No sample mailbox is displayed, even when disconnected or an API request fails.

## Run

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Copy `.env.example` to `.env.local` and configure your own OAuth credentials for local Gmail access. Production credentials are configured separately in hosting.

## Google configuration

Enable the Gmail API. Use an External Google OAuth web client. Register the exact `/api/auth/google/callback` URL for each environment. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SESSION_SECRET`, and `SUPPORT_EMAIL`.

Declare `openid`, `email`, `https://www.googleapis.com/auth/gmail.readonly`, and `https://www.googleapis.com/auth/gmail.send` in Google Auth Platform Data Access. Existing send-only connections must reconnect and grant both reading and sending permissions. Use Production audience for public access and complete the applicable Google verification; reading is a restricted scope. See [GOOGLE-LAUNCH.md](GOOGLE-LAUNCH.md).

## Mailbox behavior

- One row per Gmail message, with all inbox categories, system folders, and user labels.
- Inbox and user-label badges show Gmail unread message counts. Other folder badges show Gmail total message counts. These are message counts, not conversation counts.
- Pages contain up to 25 messages and follow Gmail page tokens through the mailbox. Folder totals come from Gmail label details. Search and category views show the fetched range and whether more messages exist; Gmail's estimated result count is never presented as an exact total.
- HTML messages render in an isolated sandbox with scripts and remote content blocked. Named attachments can be downloaded. Inline remote images remain blocked.
- Read-only access leaves Gmail read status, stars, labels, and existing drafts unchanged. Open in Gmail provides mailbox management. Reading or rendering an email never sends one.
- Compose, reply, and forward send only when the user clicks Send. Forwarding includes message text, not attachments. Local compose drafts are stored in this tab's session storage, not uploaded to Gmail drafts.
- Mailbox data stays in page memory and server responses use no-store caching. Tokens are stored in an encrypted HTTP-only cookie; secrets and Google tokens are not returned in JSON.

## Checks

```bash
npm run check
npm test
npm run test:e2e
npm run build
```

Browser/API tests use a separate local server and synthetic Google responses; they never access a real mailbox or send real email. On Windows they use installed Chrome; elsewhere install Playwright Chromium with `npx playwright install chromium`.
