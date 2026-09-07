import "../styles.css";

export const metadata = {
  title: "Inbox (3) - Demo Mail",
  description: "A fully interactive Gmail-style mailbox demo built with Next.js."
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8fafd"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
