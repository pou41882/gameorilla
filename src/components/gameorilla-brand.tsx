import type { SVGProps } from "react";

type MarkProps = SVGProps<SVGSVGElement>;

export function GameorillaMark({ className, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Gameorilla"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      <rect width="64" height="64" rx="8" fill="#04050A" />
      <path d="M13 23h5v-5h7v-5h14v5h7v5h5v24h-5v6H18v-6h-5V23Z" fill="#8D46FF" />
      <path d="M18 25h5v-5h18v5h5v21h-5v5H23v-5h-5V25Z" fill="#04050A" />
      <path d="M18 30h28v11H18z" fill="#F3F6FF" />
      <path d="M22 33h7v5h-7zM35 33h3v3h-3zM40 33h3v3h-3zM35 38h3v3h-3zM40 38h3v3h-3z" fill="#04050A" />
      <path d="M23 35h5v1h-5z" fill="#27E7E2" />
      <path d="M38 34h2v2h-2zM41 37h2v2h-2z" fill="#FF3EA8" />
      <path d="M25 45h14v3H25z" fill="#5130C9" />
      <path d="M9 10h12v3H9zM43 10h12v3H43z" fill="#27E7E2" />
      <path d="M9 53h16v3H9zM39 53h16v3H39z" fill="#FF3EA8" />
    </svg>
  );
}

export function GameorillaLogo({ className = "", ...props }: MarkProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <GameorillaMark className="h-11 w-11 shrink-0" {...props} />
      <span className="leading-none">
        <span className="block text-xl font-black uppercase tracking-[-0.08em] text-[#27E7E2] sm:text-2xl">
          Game<span className="text-[#FF3EA8]">orilla</span>
        </span>
        <span className="mt-1 block font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#8D46FF]">
          Ape Vice Arcade
        </span>
      </span>
    </span>
  );
}
