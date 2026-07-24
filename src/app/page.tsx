import Link from "next/link";
import { GameorillaLogo } from "@/components/gameorilla-brand";

const steps = [
  ["01", "Pull up", "Create a private room and get a two-word room code."],
  ["02", "Bring the crew", "Pass the code around. Everybody joins from their own phone."],
  ["03", "Make it nasty", "Finish the prompt, vote for the sharpest answer, run it back."],
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-5 text-[#F3F6FF] sm:px-9 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 border-b-2 border-[#8D46FF] pb-5">
          <GameorillaLogo />
          <nav aria-label="Main navigation" className="hidden gap-5 text-xs font-black uppercase tracking-[.12em] text-[#27E7E2] sm:flex">
            <Link href="/how-to-play" className="hover:text-[#FF3EA8]">How it works</Link>
            <Link href="/support" className="hover:text-[#FF3EA8]">Help desk</Link>
          </nav>
        </header>

        <section className="grid gap-9 py-16 lg:grid-cols-[1.2fr_.8fr] lg:py-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 border-2 border-[#27E7E2] bg-[#04050A] px-3 py-2 text-xs font-black uppercase tracking-[.16em] text-[#27E7E2]">
              <span className="h-2 w-2 bg-[#FF3EA8]" /> Open after dark
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-[.9] tracking-[-.08em] sm:text-7xl lg:text-8xl">
              Ape Vice<br />
              <span className="text-[#FF3EA8]">Arcade.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base font-bold leading-relaxed text-[#F3F6FF]/80 sm:text-lg">
              Quick rooms. Loud opinions. Banana stacks. Gameorilla is the neon
              corner for a crew that wants one more round before the night peels out.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/games/fill-in-the-blank" className="border-2 border-[#27E7E2] bg-[#27E7E2] px-6 py-4 font-black text-[#04050A] shadow-[6px_6px_0_#FF3EA8] transition hover:-translate-y-1 hover:shadow-[9px_9px_0_#FF3EA8]">
                Enter the arcade →
              </Link>
              <Link href="/how-to-play" className="border-2 border-[#8D46FF] px-6 py-4 font-black text-[#F3F6FF] transition hover:border-[#FF3EA8] hover:text-[#FF3EA8]">
                Learn the rules
              </Link>
            </div>
          </div>

          <aside className="relative overflow-hidden border-2 border-[#FF3EA8] bg-[#04050A] p-7 shadow-[10px_10px_0_#5130C9]">
            <div className="absolute inset-x-0 top-0 h-2 bg-[#FF3EA8]" />
            <GameorillaLogo className="h-auto w-full max-w-none" />
            <p className="mt-9 text-xs font-black uppercase tracking-[.16em] text-[#27E7E2]">Tonight&apos;s cabinet</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-.07em] text-[#F3F6FF]">Fill in the Blank</h2>
            <p className="mt-4 leading-relaxed text-[#F3F6FF]/75">Finish the prompt. Vote for the line that hits hardest. No cash on the table—just bragging rights and banana energy.</p>
            <Link href="/games/fill-in-the-blank" className="mt-7 inline-block text-sm font-black uppercase tracking-[.12em] text-[#FF3EA8] hover:text-[#27E7E2]">Play now →</Link>
          </aside>
        </section>

        <section className="border-y-2 border-[#5130C9] py-12">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#FF3EA8]">No tutorial boss fight</p>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {steps.map(([number, title, copy]) => (
              <article key={number} className="border-2 border-[#27E7E2] bg-[#04050A] p-5">
                <p className="text-sm font-black text-[#FF3EA8]">{number}</p>
                <h2 className="mt-5 text-xl font-black text-[#27E7E2]">{title}</h2>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-[#F3F6FF]/75">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="flex flex-wrap justify-between gap-5 py-8 text-xs font-bold uppercase tracking-[.1em] text-[#F3F6FF]/60">
          <p>Gameorilla · Ape Vice Arcade</p>
          <div className="flex gap-4">
            <Link href="/faq" className="hover:text-[#27E7E2]">FAQ</Link>
            <Link href="/support" className="hover:text-[#27E7E2]">Support</Link>
            <Link href="/privacy" className="hover:text-[#27E7E2]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#27E7E2]">Terms</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
