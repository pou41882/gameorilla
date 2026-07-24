"use client";

import { useState } from "react";
import { getOrCreateAnonymousUser, supabase } from "@/lib/supabase";
import { reportClientError } from "@/lib/error-reporting";

export type AdvanceResult = {
  action: "next_round" | "tiebreaker" | "finished";
  room_status: "writing" | "finished";
  room_id: string;
  room_code: string;
  round_id?: string;
  round_number?: number;
  prompt_text?: string;
  phase?: "writing";
  writing_ends_at?: string | null;
  is_tiebreaker?: boolean;
  winner_player_ids?: string[];
  winner_score?: number;
};

type NextRoundButtonProps = {
  roomCode: string;
  isHost: boolean;
  onAdvanced: (result: AdvanceResult) => Promise<void> | void;
};

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Could not start the next round.";
}

export function NextRoundButton({
  roomCode,
  isHost,
  onAdvanced,
}: NextRoundButtonProps) {
  const [message, setMessage] = useState("");
  const [isAdvancing, setIsAdvancing] = useState(false);

  async function advanceGame() {
    setIsAdvancing(true);
    setMessage("");

    try {
      await getOrCreateAnonymousUser();

      const { data, error } = await supabase.rpc("advance_after_results", {
        p_room_code: roomCode,
      });

      if (error) {
        throw error;
      }

      const result = data as AdvanceResult | null;

      if (!result?.action) {
        throw new Error("The game did not return a next step.");
      }

      await onAdvanced(result);

      if (result.action === "tiebreaker") {
        setMessage("Sudden death is live. Only tied leaders answer.");
      }

      if (result.action === "finished") {
        setMessage("Game complete. Winner screen comes next.");
      }
    } catch (error) {
      void reportClientError({
        errorCode: "game.advance_failed",
        phase: "advance",
      });
      setMessage(getErrorMessage(error));
    } finally {
      setIsAdvancing(false);
    }
  }

  if (!isHost) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-[#04050A] bg-[#F3F6FF] px-5 py-4 text-center font-bold text-[#04050A]">
        Waiting for the host to start the next round…
      </p>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={advanceGame}
        disabled={isAdvancing}
        className="w-full rounded-2xl border-2 border-[#04050A] bg-[#04050A] px-7 py-4 text-lg font-black text-[#F3F6FF] transition hover:-translate-y-1 hover:bg-[#FF5E78] disabled:cursor-wait disabled:opacity-60"
      >
        {isAdvancing ? "Starting…" : "Start next round"}
      </button>

      {message && (
        <p className="mt-3 text-center font-bold text-[#04050A]">
          {message}
        </p>
      )}
    </div>
  );
}

