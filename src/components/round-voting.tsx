"use client";

import { useEffect, useRef, useState } from "react";
import { getOrCreateAnonymousUser, supabase } from "@/lib/supabase";
import { reportClientError } from "@/lib/error-reporting";

type VotingOption = {
  vote_answer_id: string;
  vote_answer_text: string;
};

type VotingResult = {
  vote_round_id: string;
  selected_answer_id: string;
  votes_received: number;
  voters_expected: number;
  all_votes_in: boolean;
};

type VotingAdvanceResult = {
  advanced: boolean;
  phase: string;
  round_id: string;
};

type ResolveResult = {
  resolved: boolean;
  phase: string;
  round_id: string;
};

type WritingToVotingBridgeProps = {
  roomCode: string;
  roundId: string;
  phase: string;
  secondsRemaining: number | null;
  onVotingOpen: () => void;
};

type VotingToResultsBridgeProps = {
  roomCode: string;
  roundId: string;
  phase: string;
  onResultsOpen: () => void;
};

type VotingFormProps = {
  roomCode: string;
  roundId: string;
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

  return "Something went wrong. Try again.";
}

export function WritingToVotingBridge({
  roomCode,
  roundId,
  phase,
  secondsRemaining,
  onVotingOpen,
}: WritingToVotingBridgeProps) {
  const attemptedRoundRef = useRef<string | null>(null);

  useEffect(() => {
    if (phase !== "writing" || secondsRemaining !== 0) {
      return;
    }

    if (attemptedRoundRef.current === roundId) {
      return;
    }

    attemptedRoundRef.current = roundId;

    async function openVoting() {
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

        const result = data as VotingAdvanceResult | null;

        if (result?.phase === "voting") {
          onVotingOpen();
        }
      } catch (error) {
        console.error("Could not open voting:", error);
        void reportClientError({
          errorCode: "game.voting_open_failed",
          phase: "voting",
        });
      }
    }

    void openVoting();
  }, [onVotingOpen, phase, roomCode, roundId, secondsRemaining]);

  return null;
}

export function VotingToResultsBridge({
  roomCode,
  roundId,
  phase,
  onResultsOpen,
}: VotingToResultsBridgeProps) {
  const onResultsOpenRef = useRef(onResultsOpen);
  const openedRoundRef = useRef<string | null>(null);

  useEffect(() => {
    onResultsOpenRef.current = onResultsOpen;
  }, [onResultsOpen]);

  useEffect(() => {
    if (phase !== "voting") {
      return;
    }

    let cancelled = false;

    async function checkForResults() {
      if (openedRoundRef.current === roundId) {
        return;
      }

      try {
        await getOrCreateAnonymousUser();

        const { data, error } = await supabase.rpc(
          "resolve_round_if_ready",
          {
            p_room_code: roomCode,
          },
        );

        if (error) {
          throw error;
        }

        const result = data as ResolveResult | null;

        if (!cancelled && result?.phase === "results") {
          openedRoundRef.current = roundId;
          onResultsOpenRef.current();
        }
      } catch (error) {
        console.error("Could not resolve round:", error);
        void reportClientError({
          errorCode: "game.round_resolve_failed",
          phase: "results",
        });
      }
    }

    void checkForResults();

    const interval = window.setInterval(() => {
      void checkForResults();
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [phase, roomCode, roundId]);

  return null;
}

export function VotingForm({ roomCode, roundId }: VotingFormProps) {
  const [options, setOptions] = useState<VotingOption[]>([]);
  const [selectedAnswerId, setSelectedAnswerId] = useState("");
  const [savedAnswerId, setSavedAnswerId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadVotingOptions() {
      setIsLoading(true);
      setMessage("");
      setSelectedAnswerId("");
      setSavedAnswerId("");

      try {
        await getOrCreateAnonymousUser();

        const { data, error } = await supabase.rpc("get_voting_options", {
          p_room_code: roomCode,
        });

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setOptions((data as VotingOption[] | null) ?? []);
        }
      } catch (error) {
        void reportClientError({
          errorCode: "game.voting_options_failed",
          phase: "voting",
        });
        if (!cancelled) {
          setMessage(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadVotingOptions();

    return () => {
      cancelled = true;
    };
  }, [roomCode, roundId]);

  async function saveVote() {
    if (!selectedAnswerId) {
      setMessage("Pick an answer first.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      await getOrCreateAnonymousUser();

      const { data, error } = await supabase.rpc("cast_round_vote", {
        p_room_code: roomCode,
        p_answer_id: selectedAnswerId,
      });

      if (error) {
        throw error;
      }

      const result = (data as VotingResult[] | null)?.[0];

      if (!result) {
        throw new Error("Your vote was not saved.");
      }

      setSavedAnswerId(selectedAnswerId);

      setMessage(
        result.all_votes_in
          ? "Vote locked. Counting results…"
          : "Vote locked. You can still change it while the room waits.",
      );
    } catch (error) {
      void reportClientError({
        errorCode: "game.vote_save_failed",
        phase: "voting",
      });
      setMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] p-6 font-bold">
        Shuffling the answers…
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#04050A] bg-[#F3F6FF] p-6 font-bold">
        No eligible answers yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em]">
            Pick your favorite
          </p>
          <p className="mt-1 font-semibold text-[#04050A]">
            You cannot vote for yourself.
          </p>
        </div>

        <p className="text-sm font-bold text-[#04050A]">
          {options.length} option{options.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {options.map((option) => {
          const selected = selectedAnswerId === option.vote_answer_id;

          return (
            <button
              key={option.vote_answer_id}
              type="button"
              onClick={() => setSelectedAnswerId(option.vote_answer_id)}
              disabled={isSaving}
              className={`rounded-xl border-2 px-5 py-4 text-left text-lg font-black transition ${
                selected
                  ? "border-[#04050A] bg-[#FF3EA8]"
                  : "border-[#04050A] bg-[#F3F6FF] hover:-translate-y-0.5 hover:bg-[#F3F6FF]"
              }`}
            >
              {option.vote_answer_text}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-[#04050A]">
          {message || "Choose wisely. Everybody gets one vote."}
        </p>

        <button
          type="button"
          onClick={saveVote}
          disabled={!selectedAnswerId || isSaving}
          className="rounded-xl border-2 border-[#04050A] bg-[#04050A] px-5 py-3 font-black text-[#F3F6FF] transition hover:bg-[#FF5E78] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving
            ? "Saving…"
            : savedAnswerId
              ? "Update vote"
              : "Lock vote"}
        </button>
      </div>
    </div>
  );
}

