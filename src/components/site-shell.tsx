import Link from "next/link";
import type { ReactNode } from "react";
import { GameorillaLogo, GameorillaMark } from "@/components/gameorilla-brand";

const footerLinks = [
  ["How to play", "/how-to-play"],
  ["FAQ", "/faq"],
  ["Support", "/support"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
] as const;

export function SiteShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F3F6FF] px-6 py-7 text-[#04050A] sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col">
        <header className="flex items-center justify-between gap-6 rounded-full bg-[#F3F6FF]">
          <GameorillaLogo />
          <Link
            href="/games/fill-in-the-blank"
            className="rounded-full bg-[#04050A] px-5 py-3 text-sm font-black text-[#F3F6FF] transition hover:-translate-y-0.5 hover:bg-[#8D46FF]"
          >
            Play now
          </Link>
        </header>

        <section className="flex-1 py-14 sm:py-20">
          <div className="flex items-center gap-2 text-[#FF5E78]">
            <GameorillaMark className="h-7 w-7" />
            <p className="text-sm font-black uppercase tracking-[0.14em]">
            {eyebrow}
            </p>
          </div>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-[#04050A]/75">
            {intro}
          </p>

          <div className="mt-10 space-y-6">{children}</div>
        </section>

        <footer className="border-t-2 border-[#04050A] py-6">
          <nav aria-label="Site information" className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-black">
            {footerLinks.map(([label, href]) => (
              <Link key={href} href={href} className="underline-offset-4 hover:underline">
                {label}
              </Link>
            ))}
          </nav>
          <p className="mt-4 text-sm font-semibold text-[#04050A]/70">
            Gameorilla is a general-audience party-game site for people age 13 and older.
          </p>
        </footer>
      </div>
    </main>
  );
}

export function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border-2 border-[#04050A] bg-[#F3F6FF] p-6 shadow-[6px_6px_0_#27E7E2] sm:p-8">
      <h2 className="text-2xl font-black tracking-[-0.03em]">{title}</h2>
      <div className="mt-4 space-y-3 font-semibold leading-relaxed text-[#04050A]/75">
        {children}
      </div>
    </section>
  );
}
