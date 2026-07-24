import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Gameorilla collects, uses, protects, and deletes game and support information.",
};

export default function PrivacyPage() {
  return (
    <SiteShell eyebrow="Effective July 16, 2026" title="Privacy policy" intro="We collect the minimum information needed to run temporary multiplayer rooms, respond to support requests, protect players, and keep the service reliable.">
      <InfoCard title="Information we collect">
        <p>When you play, we create a temporary anonymous account identifier and store your display name, room membership, answers, votes, scores, and basic timestamps.</p>
        <p>If you contact support, we collect the reply email, category, and message you choose to provide. If you report an answer, we retain the reported text, author display name, room identifier, reason, and optional details.</p>
        <p>Our hosting and database providers may process technical information such as IP address, browser details, and security logs to deliver and protect the service.</p>
      </InfoCard>
      <InfoCard title="How we use information">
        <p>We use information to operate rooms, restore sessions after refreshes, calculate scores, investigate safety reports, answer support requests, prevent abuse, troubleshoot failures, and improve Gameorilla.</p>
        <p>We do not sell personal information. We do not currently use targeted advertising.</p>
      </InfoCard>
      <InfoCard title="Sharing and service providers">
        <p>Game data is processed by Supabase, our database and authentication provider, and Vercel, our website hosting provider. We may disclose information when required by law or when reasonably necessary to protect people, the service, or our rights.</p>
      </InfoCard>
      <InfoCard title="Retention">
        <p>Finished game rooms are normally removed after two hours; other abandoned rooms after 24 hours. Anonymous account records are normally removed after 30 days once associated rooms are gone.</p>
        <p>Answer reports are normally kept up to 90 days. Support requests are normally kept up to one year, or 90 days after resolution when that is sooner.</p>
      </InfoCard>
      <InfoCard title="Your choices">
        <p>You may leave a room at any time and clear the site’s browser storage. To request access to or deletion of support or safety information associated with you, use the <Link href="/support" className="font-black underline">support form</Link>.</p>
      </InfoCard>
      <InfoCard title="Age guidance">
        <p>Gameorilla is a general-audience service intended for people age 13 and older. It is not directed to children under 13, and we do not knowingly collect personal information from them.</p>
        <p>If you believe a child under 13 submitted personal information, contact us through support so we can investigate and delete it.</p>
      </InfoCard>
      <InfoCard title="Policy changes and contact">
        <p>We may update this policy as the service changes. The effective date above will be updated when material changes are made.</p>
        <p>Privacy questions and requests can be submitted through <Link href="/support" className="font-black underline">Gameorilla Support</Link>.</p>
      </InfoCard>
    </SiteShell>
  );
}

