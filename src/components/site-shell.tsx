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
    <main className="min-h-screen overflow-hidden bg-[#04050A] px-3 py-3 text-[#F3F6FF] sm:px-6 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-5xl flex-col border-4 border-[#27E7E2] bg-[#04050A] shadow-[10px_10px_0_#FF3EA8] sm:min-h-[calc(100vh-3rem)] sm:shadow-[16px_16px_0_#FF3EA8]">
        <header className="flex items-center justify-between gap-4 border-b-4 border-[#27E7E2] bg-[#04050A] px-4 py-3 sm:px-6">
          <GameorillaLogo />
          <Link
            href="/games/fill-in-the-blank"
            className="border-2 border-[#F3F6FF] bg-[#FF3EA8] px-4 py-2 text-xs font-black uppercase tracking-[.1em] text-[#04050A] transition hover:bg-[#27E7E2] sm:px-5 sm:py-3 sm:text-sm"
          >
            Press start
          </Link>
        </header>

        <section className="relative flex-1 overflow-hidden bg-[linear-gradient(#04050A_0_68%,#120A23_68%_100%)] px-5 py-12 sm:px-10 sm:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgb(91_255_243_/_0.3)_1px,transparent_1px),linear-gradient(90deg,rgb(255_62_168_/_0.2)_1px,transparent_1px)] [background-size:24px_24px]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 border-t-4 border-[#FF3EA8] bg-[repeating-linear-gradient(90deg,#5130C9_0_20px,#8D46FF_20px_40px)] opacity-85 sm:h-14" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[#FF5E78]">
              <GameorillaMark className="h-7 w-7" />
              <p className="border-2 border-[#FF3EA8] bg-[#04050A] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] sm:text-xs">
                {eyebrow}
              </p>
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black uppercase leading-[.9] tracking-[-0.06em] text-[#F3F6FF] sm:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl border-l-4 border-[#27E7E2] pl-4 text-base font-bold leading-relaxed text-[#F3F6FF]/80 sm:text-lg">
              {intro}
            </p>

            <div className="mt-10 space-y-5">{children}</div>
          </div>
        </section>

        <footer className="border-t-4 border-[#5130C9] bg-[#04050A] px-5 py-5 sm:px-6">
          <nav aria-label="Site information" className="flex flex-wrap gap-x-5 gap-y-3 text-xs font-black uppercase tracking-[.08em] text-[#F3F6FF]">
            {footerLinks.map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-[#27E7E2]">
                {label}
              </Link>
            ))}
          </nav>
          <p className="mt-4 text-xs font-bold uppercase tracking-[.08em] text-[#F3F6FF]/65">
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
    <section className="border-2 border-[#27E7E2] bg-[#071B21] p-5 shadow-[6px_6px_0_#5130C9] sm:p-7">
      <h2 className="border-b-2 border-[#FF3EA8] pb-3 text-xl font-black uppercase tracking-[-0.03em] text-[#F3F6FF] sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-3 font-semibold leading-relaxed text-[#F3F6FF]/80">
        {children}
      </div>
    </section>
  );
}
