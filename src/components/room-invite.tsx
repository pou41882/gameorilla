"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { displayRoomCode, roomCodeSlug } from "@/lib/room-codes.mjs";

type RoomInviteProps = {
  roomCode: string;
  compact?: boolean;
};

export function RoomInvite({ roomCode, compact = false }: RoomInviteProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    const url = new URL("/games/fill-in-the-blank", window.location.origin);
    url.searchParams.set("room", roomCodeSlug(roomCode));
    const nextJoinUrl = url.toString();

    const stateTimeout = window.setTimeout(() => setJoinUrl(nextJoinUrl), 0);

    if (canvasRef.current) {
      void QRCode.toCanvas(canvasRef.current, nextJoinUrl, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: compact ? 132 : 164,
          color: {
            dark: "#04050A",
            light: "#F3F6FF",
          },
        })
        .catch(() => undefined);
    }

    return () => window.clearTimeout(stateTimeout);
  }, [compact, roomCode]);

  return (
    <div className="flex items-center gap-4">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`QR code to join room ${displayRoomCode(roomCode)}`}
        className="h-[132px] w-[132px] shrink-0 rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] p-1"
      />
      {!compact && (
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.14em]">
            Scan to join
          </p>
          <p className="mt-2 text-sm font-bold leading-snug text-[#04050A]">
            Point a phone camera here. The room name will already be filled in.
          </p>
          {joinUrl && (
            <a
              href={joinUrl}
              className="mt-2 block truncate text-xs font-black underline"
            >
              Open join link
            </a>
          )}
        </div>
      )}
    </div>
  );
}
