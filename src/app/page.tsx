import Link from "next/link";
import { GameorillaLogo } from "@/components/gameorilla-brand";

const footerLinks = [
  ["How to play", "/how-to-play"],
  ["FAQ", "/faq"],
  ["Support", "/support"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
] as const;

const heroStars = [
  { left: "3%", top: "8%", color: "#F3F6FF", size: "2px" },
  { left: "8%", top: "24%", color: "#27E7E2", size: "3px" },
  { left: "13%", top: "10%", color: "#FF3EA8", size: "2px" },
  { left: "18%", top: "34%", color: "#F3F6FF", size: "2px" },
  { left: "23%", top: "16%", color: "#8D46FF", size: "3px" },
  { left: "27%", top: "42%", color: "#27E7E2", size: "2px" },
  { left: "32%", top: "7%", color: "#F3F6FF", size: "2px" },
  { left: "39%", top: "27%", color: "#FF3EA8", size: "2px" },
  { left: "47%", top: "11%", color: "#F3F6FF", size: "3px" },
  { left: "54%", top: "22%", color: "#27E7E2", size: "2px" },
  { left: "61%", top: "8%", color: "#8D46FF", size: "2px" },
  { left: "68%", top: "35%", color: "#F3F6FF", size: "2px" },
  { left: "73%", top: "14%", color: "#FF3EA8", size: "3px" },
  { left: "79%", top: "29%", color: "#27E7E2", size: "2px" },
  { left: "84%", top: "8%", color: "#F3F6FF", size: "2px" },
  { left: "90%", top: "38%", color: "#8D46FF", size: "3px" },
  { left: "95%", top: "18%", color: "#FF3EA8", size: "2px" },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#04050A] px-3 py-3 text-[#F3F6FF] sm:px-6 sm:py-6">
      <section className="mx-auto max-w-[1080px] border-4 border-[#27E7E2] bg-[#04050A] shadow-[10px_10px_0_#FF3EA8] sm:shadow-[16px_16px_0_#FF3EA8]">
        <header className="grid grid-cols-3 gap-2 border-b-4 border-[#27E7E2] bg-[#04050A] px-3 py-3 text-center text-[10px] font-black uppercase leading-tight tracking-[.08em] text-[#F3F6FF] sm:px-6 sm:text-sm">
          <p><span className="block text-[#FF3EA8]">1UP</span>Bananas 00010</p>
          <p><span className="block text-[#FF3EA8]">High Banana</span>01500</p>
          <p><span className="block text-[#FF3EA8]">Vice Meter</span>Level 01</p>
        </header>

        <div className="relative overflow-hidden border-b-4 border-[#27E7E2] bg-[#04050A]">
          <GameorillaLogo className="block h-auto w-full max-w-none [image-rendering:pixelated]" />

          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[55%] overflow-hidden">
            {heroStars.map((star) => (
              <span
                key={`${star.left}-${star.top}`}
                className="absolute"
                style={{
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  backgroundColor: star.color,
                  boxShadow: `0 0 6px ${star.color}`,
                }}
              />
            ))}
          </div>

          <p className="absolute left-1/2 top-[4%] z-10 -translate-x-1/2 whitespace-nowrap border-2 border-[#FF3EA8] bg-[#04050A]/90 px-3 py-1 text-[8px] font-black uppercase tracking-[.18em] text-[#FF3EA8] sm:text-xs">
            PoundTown Games presents
          </p>
        </div>

        <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_10%,#5130c9_0,transparent_34%),linear-gradient(#04050A_0_58%,#120a23_58%_100%)] px-4 py-7 sm:px-10 sm:py-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[-1] opacity-25 [background-image:linear-gradient(rgb(91_255_243_/_0.26)_1px,transparent_1px),linear-gradient(90deg,rgb(255_62_168_/_0.2)_1px,transparent_1px)] [background-size:20px_20px]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-12 border-t-4 border-[#FF3EA8] bg-[repeating-linear-gradient(90deg,#5130C9_0_22px,#8D46FF_22px_44px)] opacity-90 sm:h-16" />
          <div aria-hidden="true" className="absolute bottom-8 left-4 hidden text-5xl font-black leading-none text-[#27E7E2] sm:block">▟▟</div>
          <div aria-hidden="true" className="absolute bottom-8 right-4 hidden text-5xl font-black leading-none text-[#FF3EA8] sm:block">▙▙</div>

          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <h1 className="sr-only">PoundTown Games presents Gameorilla: the ape vice arkade</h1>
            <p className="max-w-xl text-xs font-black uppercase leading-relaxed tracking-[.13em] text-[#F3F6FF] sm:text-sm">
              The neon after-hours party cabinet. Bring your crew. Stack bananas. Make the room laugh.
            </p>

            <nav aria-label="Arcade start menu" className="mt-7 w-full max-w-md border-4 border-[#F3F6FF] bg-[#04050A] p-2 text-left shadow-[6px_6px_0_#5130C9] sm:p-3">
              <Link
                href="/games/fill-in-the-blank"
                className="group flex items-center gap-3 bg-[#FF3EA8] px-3 py-3 text-sm font-black uppercase tracking-[.1em] text-[#04050A] transition hover:bg-[#27E7E2] sm:text-base"
              >
                <span aria-hidden="true" className="animate-pulse text-lg leading-none">▶</span>
                Start game <span className="ml-auto text-[10px] sm:text-xs">3–8 players</span>
              </Link>
              <Link href="/how-to-play" className="mt-1 flex items-center gap-3 px-3 py-3 text-xs font-black uppercase tracking-[.1em] text-[#F3F6FF] transition hover:bg-[#5130C9] hover:text-[#27E7E2] sm:text-sm">
                <span aria-hidden="true">•</span> How to play
              </Link>
              <Link href="/support" className="mt-1 flex items-center gap-3 px-3 py-3 text-xs font-black uppercase tracking-[.1em] text-[#F3F6FF] transition hover:bg-[#5130C9] hover:text-[#27E7E2] sm:text-sm">
                <span aria-hidden="true">•</span> Help desk
              </Link>
            </nav>

            <Link href="/games/fill-in-the-blank" className="mt-7 text-sm font-black uppercase tracking-[.2em] text-[#F3F6FF] underline decoration-2 underline-offset-4 transition hover:text-[#27E7E2] motion-safe:animate-pulse">
              Press start
            </Link>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[.14em] text-[#F3F6FF]/65">
              Tonight&apos;s cabinet: Fill in the Blank · Banana target: 5 / 10 / 15
            </p>
          </div>
        </div>

        <section className="grid gap-3 border-t-4 border-[#27E7E2] bg-[#04050A] p-4 text-center sm:grid-cols-3 sm:p-5">
          <article className="border-2 border-[#27E7E2] bg-[#071b21] px-3 py-4">
            <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#27E7E2]">Insert crew</p>
            <p className="mt-2 text-xs font-bold leading-relaxed text-[#F3F6FF]/80">Open a private room and pass the code around.</p>
          </article>
          <article className="border-2 border-[#FF3EA8] bg-[#221021] px-3 py-4">
            <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#FF3EA8]">Choose a stack</p>
            <p className="mt-2 text-xs font-bold leading-relaxed text-[#F3F6FF]/80">Play first to 5, 10, or 15 bananas.</p>
          </article>
          <article className="border-2 border-[#8D46FF] bg-[#160f2b] px-3 py-4">
            <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#8D46FF]">Vote loud</p>
            <p className="mt-2 text-xs font-bold leading-relaxed text-[#F3F6FF]/80">Finish the prompt. Pick the line that lands.</p>
          </article>
        </section>

        <footer className="flex flex-col gap-3 border-t-4 border-[#5130C9] bg-[#04050A] px-4 py-5 text-center text-[10px] font-black uppercase tracking-[.1em] text-[#F3F6FF]/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Gameorilla · the ape vice arkade · Free test night</p>
          <nav aria-label="Site information" className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {footerLinks.map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-[#27E7E2]">{label}</Link>
            ))}
          </nav>
        </footer>
      </section>
    </main>
  );
}
