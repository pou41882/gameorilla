import type { Metadata } from "next";
import BlanketyBlankGame from "@/games/blankety-blank/blankety-blank-game";

export const metadata: Metadata = {
  title: "Fill in the Blank",
  description: "Create or join a Fill in the Blank room, send your line, vote, and play together anywhere.",
  alternates: { canonical: "/games/fill-in-the-blank" },
};

export default function FillInTheBlankPage() {
  return <BlanketyBlankGame />;
}
