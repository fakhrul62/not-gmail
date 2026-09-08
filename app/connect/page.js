import { gmailConfigured } from "../lib/gmail";

export const dynamic = "force-dynamic";
export const metadata = { title: "Connect Gmail | Not Gmail" };

export default function ConnectPage() {
  return (
    <main className="public-page">
      <article className="public-card">
        <a href="/">Not Gmail</a>
        <h1>Send email from your Gmail account.</h1>
        <p>Connect your Google account, approve sending access, and write your first message. No API keys or technical setup needed.</p>
        <ol>
          <li>Choose your Google account.</li>
          <li>Allow Not Gmail to send email on your behalf.</li>
          <li>Return to the mailbox and click Compose.</li>
        </ol>
        <p>We request your account email address and permission to send messages. We cannot read or delete your Gmail messages. The inbox shown in this app contains sample messages.</p>
        {gmailConfigured() ? (
          <a className="public-connect" href="/api/auth/google?returnTo=/">Connect Gmail</a>
        ) : (
          <p role="status">Gmail connection is not available yet. The site owner needs to finish setup.</p>
        )}
        <p>You can sign out from the account menu or remove access from your Google Account at any time.</p>
        <footer><a href="/privacy">Privacy &amp; your data</a> · <a href="/">Explore the demo</a></footer>
        <p className="public-note">Not Gmail is an independent app and is not affiliated with Google.</p>
      </article>
    </main>
  );
}
