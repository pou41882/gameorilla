"use client";

import { useEffect, useRef, useState } from "react";
import { getOrCreateAnonymousUser, supabase } from "@/lib/supabase";
import { reportClientError } from "@/lib/error-reporting";

type VotingStatus = {
  advanced: boolean;
  phase: string;
  round_id: string;
  answers_received?: number;
  players_expected?: number;
};

type WritingControlsProps = {
  roomCode: string;
  roundId: string;
  phase: string;
  isHost: boolean;
  onVotingOpen: () => void;
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

  return "Could not start voting.";
}

export function WritingControls({
  roomCode,
  roundId,
  phase,
  isHost,
  onVotingOpen,
}: WritingControlsProps) {
  const [answersReceived, setAnswersReceived] = useState<number | null>(null);
  const [playersExpected, setPlayersExpected] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isStartingVoting, setIsStartingVoting] = useState(false);

  const onVotingOpenRef = useRef(onVotingOpen);
  const openedRoundRef = useRef<string | null>(null);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    onVotingOpenRef.current = onVotingOpen;
  }, [onVotingOpen]);

  useEffect(() => {
    if (phase !== "writing") {
      return;
    }

    let cancelled = false;

    async function checkWritingStatus() {
      if (cancelled || isCheckingRef.current) {
        return;
      }

      isCheckingRef.current = true;

      try {
        await getOrCreateAnonymousUser();

        const { data, error } = await supabase.rpc(
          "open_voting_if_ready",
          {
            p_room_code: roomCode,
          },
        );

        if (error) {
          throw error;
        }

        const result = data as VotingStatus | null;

        if (cancelled || !result || result.round_id !== roundId) {
          return;
        }

        if (typeof result.answers_received === "number") {
          setAnswersReceived(result.answers_received);
        }

        if (typeof result.players_expected === "number") {
          setPlayersExpected(result.players_expected);
        }

        if (
          result.phase === "voting" &&
          openedRoundRef.current !== roundId
        ) {
          openedRoundRef.current = roundId;
          onVotingOpenRef.current();
        }
      } catch (error) {
        console.error("Could not check writing status:", error);
        void reportClientError({
          errorCode: "game.writing_status_failed",
          phase: "writing",
        });
      } finally {
        isCheckingRef.current = false;
      }
    }

    void checkWritingStatus();

    const interval = window.setInterval(() => {
      void checkWritingStatus();
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [phase, roomCode, roundId]);

  async function startVotingNow() {
    setIsStartingVoting(true);
    setMessage("");

    try {
      await getOrCreateAnonymousUser();

      const { data, error } = await supabase.rpc("start_voting_now", {
        p_room_code: roomCode,
      });

      if (error) {
        throw error;
      }

      const result = data as VotingStatus | null;

      if (!result || result.round_id !== roundId) {
        throw new Error("The round changed before voting could start.");
      }

      if (typeof result.answers_received === "number") {
        setAnswersReceived(result.answers_received);
      }

      if (typeof result.players_expected === "number") {
        setPlayersExpected(result.players_expected);
      }

      if (result.phase === "voting") {
        openedRoundRef.current = roundId;
        onVotingOpenRef.current();
      }
    } catch (error) {
      void reportClientError({
        errorCode: "game.voting_start_failed",
        phase: "writing",
      });
      setMessage(getErrorMessage(error));
    } finally {
      setIsStartingVoting(false);
    }
  }

  const canStartEarly =
    isHost &&
    !isStartingVoting &&
    answersReceived !== null &&
    answersReceived >= 2;

  return (
    <div className="mt-5 rounded-2xl border-2 border-dashed border-[#04050A] bg-[#F3F6FF] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em]">
            Answers locked
          </p>

          <p className="mt-1 text-lg font-black">
            {answersReceived === null || playersExpected === null
              ? "Checking the room…"
              : `${answersReceived} of ${playersExpected}`}
          </p>

          <p className="mt-1 font-semibold text-[#04050A]">
            Voting starts when everyone answers or the timer ends.
          </p>
        </div>

        {isHost ? (
          <button
            type="button"
            onClick={startVotingNow}
            disabled={!canStartEarly}
            className="rounded-xl border-2 border-[#04050A] bg-[#04050A] px-5 py-3 font-black text-[#F3F6FF] transition hover:bg-[#FF5E78] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStartingVoting ? "Starting…" : "Start voting now"}
          </button>
        ) : (
          <p className="font-bold text-[#04050A]">
            Waiting for answers or the host…
          </p>
        )}
      </div>

      {isHost && answersReceived !== null && answersReceived < 2 && (
        <p className="mt-3 text-sm font-bold text-[#04050A]">
          At least two answers are needed to start voting early.
        </p>
      )}

      {message && (
        <p className="mt-3 font-bold text-[#FF5E78]">{message}</p>
      )}
    </div>
  );
}

