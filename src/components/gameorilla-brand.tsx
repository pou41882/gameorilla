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

export function GameorillaLogo({ className = "" }: LogoProps) {
  const sizing = className || "w-full max-w-56";
  const whiteO = { filter: "grayscale(1) brightness(4)" };

  return (
    <span className={`relative block overflow-hidden bg-[#04050A] ${sizing}`}>
      <img
        src="/og-gameorilla.png"
        alt="Gameorilla: the ape vice arkade"
        className="block h-auto w-full object-contain [image-rendering:pixelated]"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[28.4%] top-[3.2%] h-[56.5%] w-[44.8%] bg-[#04050A]"
        style={{
          backgroundImage: [
            "radial-gradient(circle at 8% 18%, #F3F6FF 0 1px, transparent 1.6px)",
            "radial-gradient(circle at 18% 42%, #27E7E2 0 1px, transparent 1.6px)",
            "radial-gradient(circle at 30% 9%, #FF3EA8 0 1px, transparent 1.6px)",
            "radial-gradient(circle at 42% 31%, #F3F6FF 0 1px, transparent 1.6px)",
            "radial-gradient(circle at 56% 14%, #8D46FF 0 1px, transparent 1.6px)",
            "radial-gradient(circle at 68% 38%, #27E7E2 0 1px, transparent 1.6px)",
            "radial-gradient(circle at 80% 20%, #F3F6FF 0 1px, transparent 1.6px)",
            "radial-gradient(circle at 92% 47%, #FF3EA8 0 1px, transparent 1.6px)",
          ].join(","),
        }}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[33%] top-[3.2%] aspect-square w-[34%] overflow-hidden rounded-full bg-[#04050A]"
      >
        <img
          src="/mack-rilla-stripes.svg"
          alt=""
          className="absolute left-[-9.1%] top-[-18.7%] h-auto w-[118.4%] max-w-none [image-rendering:pixelated]"
        />
      </span>

      <img
        src="/og-gameorilla.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-auto w-full object-contain [clip-path:inset(64.7%_0_0_0)] [image-rendering:pixelated]"
      />

      <img
        src="/og-gameorilla.png"
        alt=""
        aria-hidden="true"
        style={whiteO}
        className="pointer-events-none absolute inset-0 h-auto w-full object-contain [clip-path:inset(64.7%_45.1%_18.1%_48.6%)] [image-rendering:pixelated]"
      />
      <img
        src="/og-gameorilla.png"
        alt=""
        aria-hidden="true"
        style={whiteO}
        className="pointer-events-none absolute inset-0 h-auto w-full object-contain [clip-path:inset(80.4%_45.1%_7.7%_48.6%)] [image-rendering:pixelated]"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[21%] bottom-0 h-[20.5%] overflow-hidden bg-[#04050A]"
      >
        <span className="absolute left-[5%] top-[7%] h-[4%] w-[90%] bg-[#FF3EA8]" />
        <span className="absolute left-[14%] top-[17%] h-[3%] w-[72%] bg-[#5130C9]" />
        <span className="absolute left-[4%] top-[26%] h-[3%] w-[38%] bg-[#27E7E2]" />
        <span className="absolute right-[4%] top-[26%] h-[3%] w-[42%] bg-[#27E7E2]" />
        <span className="absolute left-[24%] top-[35%] h-[3%] w-[52%] bg-[#8D46FF]" />
        <span className="absolute left-[8%] top-[74%] h-[3%] w-[31%] bg-[#FF3EA8]" />
        <span className="absolute right-[8%] top-[74%] h-[3%] w-[37%] bg-[#FF3EA8]" />
        <span className="absolute left-[18%] top-[84%] h-[3%] w-[64%] bg-[#5130C9]" />
        <span className="absolute left-[32%] top-[93%] h-[3%] w-[36%] bg-[#27E7E2]" />
      </span>
      <span className="pointer-events-none absolute inset-x-[16%] bottom-[9.7%] text-center text-[clamp(.5rem,2.15vw,1.4rem)] font-black lowercase leading-none tracking-[.18em] text-[#27E7E2]">
        the ape vice arkade
      </span>
    </span>
  );
}
