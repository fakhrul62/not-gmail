import "../styles.css";
import { Google_Sans } from "next/font/google";

const googleSans = Google_Sans({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-google-sans"
});

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
    <html lang="en" className={googleSans.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
