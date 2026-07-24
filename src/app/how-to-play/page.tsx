import type { Metadata } from "next";
import { InfoCard, SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "How to Play",
  description: "Learn how to create a room, join on player devices, use a shared gameboard, answer, vote, and score.",
};

export default function HowToPlayPage() {
  return (
    <SiteShell
      eyebrow="Four easy steps"
      title="How to play"
      intro="One person opens a room, everyone joins by QR or room name, and the game keeps the party moving. No download or permanent account is required."
    >
      <InfoCard title="1. Open a room">
        <p>The captain chooses a 3-, 7-, or 13-round game and receives a funny two-word room name. Seven rounds is the default.</p>
        <p>For an in-person party, open a second device as the shared gameboard and place it where everyone can see it.</p>
      </InfoCard>
      <InfoCard title="2. Invite the players">
        <p>Players scan the lobby QR code or choose “Join a room,” enter the room name, and add a display name.</p>
        <p>Three or more players gives the best voting experience, although two players works for testing.</p>
      </InfoCard>
      <InfoCard title="3. Write and vote">
        <p>Everyone completes the same prompt. When answers are in—or the timer ends—the room votes.</p>
        <p>You cannot vote for your own answer. Each vote earns one point, and a clean sweep earns a 3× bonus.</p>
      </InfoCard>
      <InfoCard title="4. Win the game">
        <p>The game ends after 3, 7, or 13 rounds. The player with the highest score wins, and tied leaders share the win.</p>
        <p>After the final scores, the captain can start a rematch with the same group and room name.</p>
      </InfoCard>
      <InfoCard title="Keep it fun">
        <p>Gameorilla is intended for ages 13 and older. Prompts are general-audience, but player-written answers are not automatically filtered.</p>
        <p>Do not share private information or target another player. Use the report control beside a result if an answer crosses the line.</p>
      </InfoCard>
    </SiteShell>
  );
}

