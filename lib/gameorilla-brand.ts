export const brandPalette = [
  { name: "Midnight Black", hex: "#04050A" },
  { name: "Vice Cyan", hex: "#27E7E2" },
  { name: "Arcade Aqua", hex: "#5BFFF3" },
  { name: "Miami Pink", hex: "#FF3EA8" },
  { name: "Electric Purple", hex: "#8D46FF" },
  { name: "Sunset Violet", hex: "#5130C9" },
  { name: "Neon Coral", hex: "#FF5E78" },
  { name: "Pixel White", hex: "#F3F6FF" },
  { name: "Concrete Gray", hex: "#8A8EA3" },
] as const;

export const games = [
  {
    slug: "fill-in-the-blank",
    title: "Blankety Blank",
    type: "Party word game",
    description:
      "Complete the prompt, read the room, win the vote, and stack bananas. The first Gamearang game to enter Ape Vice Arcade.",
    players: "3–12 players",
    duration: "15–30 min",
    status: "in development",
    action: "Banana pot loading",
    accent: "cyan",
    icon: "▰_",
  },
  {
    slug: "night-shift-trivia",
    title: "Night Shift Trivia",
    type: "Team trivia",
    description:
      "Fast rounds, bright wins, and questions with enough bite for the after-hours crowd.",
    players: "2–16 players",
    duration: "20–40 min",
    status: "queued",
    action: "Coming later",
    accent: "pink",
    icon: "?!",
  },
  {
    slug: "neon-whodunit",
    title: "Neon Whodunit",
    type: "Social mystery",
    description:
      "Trade clues across the city, bluff with style, and name the culprit before the lights come up.",
    players: "4–10 players",
    duration: "30–60 min",
    status: "concept",
    action: "Case unopened",
    accent: "purple",
    icon: "⌕",
  },
] as const;

export const bananaRules = [
  "Earn bananas for playing, winning rounds, hosting a room, and completing featured challenges.",
  "Spend bananas on profile flair, cabinet cosmetics, social status, and future in-arcade unlocks.",
  "Bananas are Gameorilla points: no cash value, no withdrawals, no prizes, and no direct purchase at launch.",
  "PTG tokens remain separate: they pay for eligible hosted games; bananas make the Ape Vice Arcade feel alive.",
] as const;

export const audioRules = [
  { event: "UI dings", rule: "short + bright" },
  { event: "Wins", rule: "melodic + rising" },
  { event: "Errors", rule: "short + descending" },
  { event: "Timers", rule: "rhythmic tension" },
  { event: "Themes", rule: "loopable + hook-first" },
] as const;

export const implementationModules = [
  {
    title: "Brand shell",
    description:
      "Reusable tokens, typography, layout, and cabinet cards are implemented now.",
  },
  {
    title: "Game catalog",
    description:
      "A data-driven manifest can receive adapted and original PTG games without redesigning the homepage.",
  },
  {
    title: "Player systems",
    description:
      "Authentication, entitlements, credits, subscriptions, and access codes connect after the shared backend is chosen.",
  },
  {
    title: "Feedback + telemetry",
    description:
      "Game-level error reporting and privacy-conscious play analytics connect when real game sessions are live.",
  },
] as const;
