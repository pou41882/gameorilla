import type { Metadata } from "next";
import { ClientErrorMonitor } from "@/components/client-error-monitor";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gameorilla.com"),
  title: {
    default: "Gameorilla | the ape vice arkade",
    template: "%s | Gameorilla",
  },
  description: "A neon social arcade for quick rooms, wild prompts, and banana-fueled party games.",
  icons: { icon: "/gameorilla-mark.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Gameorilla",
    title: "Gameorilla | the ape vice arkade",
    description: "Create a room, bring your crew, and play the arcade anywhere.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gameorilla | the ape vice arkade",
    description: "Create a room, bring your crew, and play the arcade anywhere.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <ClientErrorMonitor />
        {children}
      </body>
    </html>
  );
}
