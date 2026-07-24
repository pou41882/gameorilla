import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Rules for using Gameorilla rooms, player-created content, safety tools, and the free beta service.",
};

export default function TermsPage() {
  return (
    <SiteShell eyebrow="Effective July 16, 2026" title="Terms of use" intro="These rules are meant to keep Gameorilla enjoyable, safe, and available while the service is in its free public-beta stage.">
      <InfoCard title="Who may use Gameorilla">
        <p>You must be at least 13 years old to use the service. By using Gameorilla, you agree to these terms and the privacy policy.</p>
      </InfoCard>
      <InfoCard title="Player conduct">
        <p>Do not use the service to threaten, harass, exploit, impersonate, expose private information, break the law, interfere with the service, automate abusive activity, or target people based on protected characteristics.</p>
        <p>Hosts are responsible for setting expectations appropriate for their group. Player-written answers are not automatically filtered.</p>
      </InfoCard>
      <InfoCard title="Your content">
        <p>You keep responsibility for text you submit. You give Gameorilla a limited permission to store, display, process, and moderate that text as needed to operate the room, investigate reports, and protect the service.</p>
        <p>Do not submit confidential information or content you do not have the right to use.</p>
      </InfoCard>
      <InfoCard title="Moderation">
        <p>We may remove content, restrict access, preserve reported material for review, or cooperate with lawful requests. Reporting does not guarantee a particular outcome.</p>
      </InfoCard>
      <InfoCard title="Availability and changes">
        <p>The service is provided on an “as available” basis during beta. Features, game names, prompts, limits, and availability may change. We do not guarantee uninterrupted or error-free operation.</p>
      </InfoCard>
      <InfoCard title="Responsibility">
        <p>To the extent permitted by law, Gameorilla is not responsible for indirect, incidental, special, or consequential losses arising from use of the free beta service or player-created content.</p>
      </InfoCard>
      <InfoCard title="Questions">
        <p>Questions about these terms can be submitted through <Link href="/support" className="font-black underline">Gameorilla Support</Link>.</p>
      </InfoCard>
    </SiteShell>
  );
}

