import type { SVGProps } from "react";

type MarkProps = SVGProps<SVGSVGElement>;
type LogoProps = {
  className?: string;
};

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

export function MackMoon({ className, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      role="img"
      aria-label="Mack, the Gameorilla house gorilla"
      className={className}
      shapeRendering="crispEdges"
      {...props}
    >
      <defs>
        <clipPath id="mack-moon-clip">
          <circle cx="120" cy="120" r="116" />
        </clipPath>
      </defs>
      <circle cx="120" cy="120" r="118" fill="#04050A" stroke="#27E7E2" strokeWidth="4" />
      <g clipPath="url(#mack-moon-clip)">
        <rect width="240" height="34" y="0" fill="#27E7E2" />
        <rect width="240" height="28" y="34" fill="#2F91F4" />
        <rect width="240" height="28" y="62" fill="#5130C9" />
        <rect width="240" height="28" y="90" fill="#8D46FF" />
        <rect width="240" height="30" y="118" fill="#FF3EA8" />
        <rect width="240" height="28" y="148" fill="#FF5E78" />
        <rect width="240" height="64" y="176" fill="#FFB400" />
      </g>
      <path d="M89 44h38v9h15v9h13v13h10v71h-9v25h-13v21h-15v14H79v-14H64v-21H51v-25H40V75h11V62h13V53h15v-9h10Z" fill="#04050A" />
      <path d="M75 92h14v-10h17v10h27v-10h15v10h12v50h-11v13h-16v-10H88v10H72v-13H60V92h15Z" fill="#F3F6FF" />
      <path d="M74 108h23v21H74zM133 108h7v7h-7zM146 108h7v7h-7zM133 122h7v7h-7zM146 122h7v7h-7z" fill="#04050A" />
      <path d="M80 114h12v9H80z" fill="#04050A" />
      <path d="M84 117h4v3h-4z" fill="#27E7E2" />
      <path d="M137 111h5v5h-5zM149 124h5v5h-5z" fill="#FF3EA8" />
      <path d="M146 111h5v5h-5zM137 124h5v5h-5z" fill="#FFB400" />
      <path d="M89 153h61v13H89z" fill="#5130C9" />
      <path d="M91 164h59v42H91z" fill="#6D6872" />
      <path d="M100 177h12v12h-12zM130 177h12v12h-12zM106 198h30v6h-30z" fill="#04050A" />
      <path d="M57 112h13v28H57zM170 112h13v28h-13z" fill="#5130C9" />
    </svg>
  );
}

export function GameorillaWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Gameorilla"
      className={`inline-flex items-center justify-center gap-[0.025em] whitespace-nowrap font-black uppercase leading-none tracking-[-0.08em] ${className}`}
    >
      <span className="text-[#27E7E2]">Game</span>
      <span className="mx-[0.04em] inline-grid h-[1.03em] w-[0.86em] place-items-center border-[0.08em] border-[#F3F6FF] bg-[repeating-linear-gradient(0deg,#FF3EA8_0_16%,#8D46FF_16%_32%,#5130C9_32%_48%,#27E7E2_48%_64%,#FFB400_64%_80%,#FF5E78_80%_100%)] text-[#04050A] shadow-[0.08em_0.08em_0_#04050A] transition-transform duration-300 hover:-translate-y-[0.06em]">
        O
      </span>
      <span className="text-[#FF3EA8]">Rilla</span>
    </span>
  );
}

export function GameorillaLogo({ className = "" }: LogoProps) {
  const sizing = className || "h-16 w-auto max-w-44 sm:h-20 sm:max-w-56";

  return (
    <img
      src="/og-gameorilla.png"
      alt="Gameorilla: Vice Arcade"
      className={`object-contain ${sizing}`}
    />
  );
}
