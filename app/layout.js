import "../styles.css";

export const metadata = {
  title: "Not Gmail",
  description: "Connect Gmail to read your messages, search your mailbox, and send email."
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
