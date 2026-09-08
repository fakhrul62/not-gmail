import { gmailConfigured } from "../lib/gmail";

export const dynamic = "force-dynamic";
export const metadata = { title: "Connect Gmail | Not Gmail" };

export default function ConnectPage() {
  return (
    <main className="public-page">
      <article className="public-card">
        <a href="/">Not Gmail</a>
        <h1>Your Gmail, connected.</h1>
        <p>Read your real messages, browse your folders and labels, search your mailbox, and send email from your Google account.</p>
        <ol>
          <li>Choose your Google account.</li>
          <li>Allow Not Gmail to read and send email.</li>
          <li>Return to your mailbox. Your messages and counts load from Gmail.</li>
        </ol>
        <p>We request your account email address, read-only Gmail access, and permission to send messages. Reading a message here does not change its read status in Gmail. Use the Open in Gmail link to organize or delete messages.</p>
        <p>Already connected before mailbox reading was added? Connect again and approve both permissions. No API keys or individual user setup needed.</p>
        {gmailConfigured() ? (
          <a className="public-connect" href="/api/auth/google?returnTo=/">Connect Gmail</a>
        ) : (
          <p role="status">Gmail connection is not available yet. The site owner needs to finish setup.</p>
        )}
        <p>You can sign out from the account menu or remove access from your Google Account at any time.</p>
        <footer><a href="/privacy">Privacy &amp; your data</a> · <a href="/">Open mailbox</a></footer>
        <p className="public-note">Not Gmail is an independent app and is not affiliated with Google.</p>
      </article>
    </main>
  );
}
