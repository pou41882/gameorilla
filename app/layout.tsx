import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gameorilla | Vice Arcade",
    template: "Gameorilla | %s",
  },
  description:
    "A neon vice-arcade universe for grown-up social games from PoundTown Games.",
  applicationName: "Gameorilla",
  keywords: [
    "Gameorilla",
    "PoundTown Games",
    "social games",
    "party games",
    "retro arcade",
  ],
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#04050A",
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
