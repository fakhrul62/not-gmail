# Gmail Interface Demo — Next.js

A Gmail-style mailbox running as a Next.js App Router application. The inbox uses local demo data, while the compose window can send real email from a connected Google account through the Gmail API.

## Run

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

For a production build:

```bash
npm run build
npm start
```

## Included interactions

- Inbox categories, folders, labels, search, and advanced search
- Reading messages, starring, selecting, pagination, and bulk actions
- Archive, spam, trash, read/unread, snooze, and undo
- Compose, reply, forward, save draft, discard, and real Gmail API sending
- Collapsible navigation and responsive mobile layout
- Quick settings for density and theme
- Gemini demo panel and Calendar, Keep, Tasks, Contacts, and Add-ons panels
- Profile, Google apps, tooltips, toast messages, and demo reset
- Google account connect, switch, and sign-out controls

All state is held in memory and resets when the page reloads. Use **More → Reset demo mailbox** to reset it without refreshing.

## Enable real Gmail sending

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Gmail API**.
3. Configure the Google Auth Platform consent screen. While the app is in testing, add each Gmail account that may sign in as a test user.
4. Create an OAuth client with application type **Web application**.
5. Add `http://localhost:3000/api/auth/google/callback` and `https://not-gmail.vercel.app/api/auth/google/callback` as authorized redirect URIs.
6. Copy `.env.example` to `.env.local` and set the Google client ID, client secret, redirect URI, and a long random session secret.

Set the same variables in Vercel, using `https://not-gmail.vercel.app/api/auth/google/callback` as the production redirect URI. The app requests only Gmail send access plus basic account identity. Google tokens are stored in an encrypted, HTTP-only cookie; client and session secrets remain server-side.

The App Router entry points are in `app/`. The original verified interface markup and browser behavior remain in `index.html` and `app.js`, loaded by the Next.js page and client initializer respectively.
