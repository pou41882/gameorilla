import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { SupportForm } from "@/components/support-form";

export const metadata: Metadata = {
  title: "Support",
  description: "Report a game problem, request privacy help, share safety concerns, or send feedback to Gameorilla.",
};

export default function SupportPage() {
  return (
    <SiteShell
      eyebrow="We can help"
      title="Gameorilla Support"
      intro="Send a game problem, safety concern, privacy or deletion request, or a useful idea. Please do not include passwords, payment details, or other sensitive information."
    >
      <SupportForm />
    </SiteShell>
  );
}

