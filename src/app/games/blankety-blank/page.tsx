import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Fill in the Blank",
  description:
    "Create or join a Fill in the Blank room, submit answers, vote, and play together anywhere.",
  alternates: { canonical: "/games/fill-in-the-blank" },
};

export default function BlanketyBlankPage() {
  redirect("/games/fill-in-the-blank");
}
