import type { Metadata } from "next";
import { InfoCard, SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about devices, accounts, room names, scoring, privacy, age guidance, and troubleshooting.",
};

export default function FaqPage() {
  return (
    <SiteShell eyebrow="Good questions" title="Frequently asked questions" intro="The short version: bring a browser, a few friends, and your best questionable judgment.">
      <InfoCard title="Does everyone need an account?">
        <p>No. Gameorilla creates a temporary anonymous game session in your browser so it can restore your room after a refresh.</p>
      </InfoCard>
      <InfoCard title="What devices work?">
        <p>Modern phones, tablets, and computers with an internet connection and current browser should work. A television connected to a computer makes a useful shared gameboard.</p>
      </InfoCard>
      <InfoCard title="Do remote parties work?">
        <p>Yes. Share the QR join link or two-word room name during a video or voice call. Each person plays on their own device.</p>
      </InfoCard>
      <InfoCard title="What happens if someone refreshes or disconnects?">
        <p>The game restores the saved room and catches up from the server. If the captain leaves, control transfers to another active player.</p>
      </InfoCard>
      <InfoCard title="Is the game for children?">
        <p>No. Gameorilla is a general-audience service intended for people age 13 and older. Player-created answers are not automatically filtered.</p>
      </InfoCard>
      <InfoCard title="How long is game data kept?">
        <p>Finished rooms are normally removed after two hours and other abandoned rooms after 24 hours. Anonymous login records are removed after 30 days once their rooms are gone.</p>
      </InfoCard>
      <InfoCard title="Something went wrong. What should I send support?">
        <p>Include the room name, device and browser, game phase, visible message, and what happened immediately before the problem. Never send a password or private key.</p>
      </InfoCard>
    </SiteShell>
  );
}

