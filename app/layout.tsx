import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KOVE OPS — Operations Command Center",
  description: "Plan work, protect uptime, and keep every operation moving from one calm command center.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
