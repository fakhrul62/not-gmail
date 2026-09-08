# Public Gmail launch

Prepared app pages: `/connect` explains the product and starts Google authorization; `/privacy` describes current data handling. Set `SUPPORT_EMAIL` to the real public contact email before launch. Review the privacy page against your hosting and operational practices.

## Production configuration

Use the existing Google Cloud project and production hosting account. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET` (a long random secret), `GOOGLE_REDIRECT_URI` (exact HTTPS production origin plus `/api/auth/google/callback`), and `SUPPORT_EMAIL` in the hosting environment. Keep credentials out of Git.

In Google Auth Platform, configure:

- Audience: External, In production.
- Branding: Not Gmail, the real support email, the production `/connect` URL as the application homepage, and the production `/privacy` URL as the privacy policy.
- Authorized domains: the domain you own and have verified in Google Search Console.
- Web OAuth client: the exact production redirect URI above.
- Data Access: `openid`, `email`, `https://www.googleapis.com/auth/gmail.send`.

## Scope justification to submit

Not Gmail lets a signed-in user compose a message and explicitly click Send to send that message from their own Gmail account. The gmail.send scope is needed to call users.messages.send. Identity scopes identify the connected account. No mailbox read, modify, or delete access is requested. Message content is processed to fulfill the user's send action; authorization tokens are stored in an encrypted HTTP-only cookie.

## Verification demonstration

Record the production site and English Google consent flow, including the app name and OAuth client ID visible in the address bar. Show Connect Gmail, choosing an account, granting sending permission, returning to the app, and composing and sending a test message to an address you control. Show delivery in Gmail. Show the privacy page and account sign-out. Upload the recording as an unlisted YouTube video and provide its link in Google's Verification Center.

Publish verified branding and submit sensitive scope verification through the Google Cloud project owner's account. Production publishing alone does not complete Google's review. Do not claim the app is verified until Google confirms approval.

Source: https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification
