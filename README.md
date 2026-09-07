# Gmail Interface Demo — Next.js

A Gmail-style mailbox running as a Next.js App Router application. It uses local demo data and does not send mail, contact a database, or require authentication.

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
- Compose, reply, forward, save draft, discard, and simulated send
- Collapsible navigation and responsive mobile layout
- Quick settings for density and theme
- Gemini demo panel and Calendar, Keep, Tasks, Contacts, and Add-ons panels
- Profile, Google apps, tooltips, toast messages, and demo reset
- Real compose-form delivery through Web3Forms

All state is held in memory and resets when the page reloads. Use **More → Reset demo mailbox** to reset it without refreshing.

Copy `.env.example` to `.env.local` and set `WEB3FORMS_ACCESS_KEY` to enable delivery locally. The value must also be configured in the Vercel project environment. Web3Forms' free plan accepts submissions from the browser, so the page provides the configured access key to its client code. Web3Forms access keys are designed to be public. Submissions are delivered to the inbox registered to the key; the address entered in the demo's **To** field is included as message metadata and used as the reply-to address.

The App Router entry points are in `app/`. The original verified interface markup and browser behavior remain in `index.html` and `app.js`, loaded by the Next.js page and client initializer respectively.
