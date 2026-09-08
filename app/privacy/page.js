export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy | Not Gmail" };

export default function PrivacyPage() {
  const supportEmail = process.env.SUPPORT_EMAIL;
  return (
    <main className="public-page">
      <article className="public-card">
        <a href="/connect">Not Gmail</a>
        <h1>Privacy &amp; your data</h1>
        <p>Updated September 8, 2026</p>
        <h2>What you authorize</h2>
        <p>Not Gmail uses Google sign-in to identify your email address and requests Gmail sending permission. It does not request permission to read or delete your Gmail messages. The inbox contains demo data.</p>
        <h2>How your data is used</h2>
        <p>When you click Send, your recipients, subject, and message pass through our server to the Gmail API to send the email from your account. Google processes and retains the sent message under its own policies. Your connected email address is displayed in the account menu.</p>
        <h2>Storage</h2>
        <p>Google access and refresh tokens and your email address are stored in an encrypted, HTTP-only session cookie with a lifetime of up to 30 days, renewed when a refreshed token is saved. Our server decrypts the cookie to make authorized Gmail requests. The app does not maintain a mailbox database.</p>
        <p>A draft may be saved in your browser's session storage while you connect Google and removed when restored. Demo mailbox changes are held in browser memory. Hosting infrastructure may process request metadata for service operation.</p>
        <h2>Sharing and limited use</h2>
        <p>Google user data is used to provide the connection and sending features. It is not sold, used for advertising, or used to train AI models. Not Gmail's use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
        <h2>Disconnecting and deleting local data</h2>
        <p>Sign out in the account menu to remove the app's session cookie. To revoke Google's authorization, remove Not Gmail from <a href="https://myaccount.google.com/connections">your Google Account connections</a>. Clear this site's browser data to remove any remaining local draft. These actions do not delete messages already sent through Gmail.</p>
        {supportEmail && <><h2>Contact</h2><p>For privacy and support questions, email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p></>}
        <footer><a href="/connect">Connect Gmail</a> · <a href="/">Back to mailbox</a></footer>
      </article>
    </main>
  );
}
