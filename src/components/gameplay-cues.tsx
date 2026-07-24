"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  playCountdownTickSound,
  playResultsSound,
  playRoundStartSound,
  playVotingSound,
  playWarningSound,
  unlockGameAudio,
} from "@/lib/game-audio";

const SOUND_STORAGE_KEY = "gameorilla-sound-enabled";

type CueKind = "start" | "warning" | "voting" | "results";

type Cue = {
  kind: CueKind;
  eyebrow: string;
  message: string;
};

type GameplayCuesProps = {
  roundId: string | null;
  roundNumber: number | null;
  phase: string | null;
  writingEndsAt: string | null;
  secondsRemaining: number | null;
};

export function useGameplayCues({
  roundId,
  roundNumber,
  phase,
  writingEndsAt,
  secondsRemaining,
}: GameplayCuesProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cue, setCue] = useState<Cue | null>(null);
  const previousRoundRef = useRef<string | null>(null);
  const previousPhaseRef = useRef<string | null>(null);
  const lastCountdownRef = useRef<string | null>(null);
  const cueTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const preferenceTimeout = window.setTimeout(
      () =>
        setSoundEnabled(
          window.localStorage.getItem(SOUND_STORAGE_KEY) !== "false",
        ),
      0,
    );

    return () => {
      window.clearTimeout(preferenceTimeout);

      if (cueTimeoutRef.current !== null) {
        window.clearTimeout(cueTimeoutRef.current);
      }
    };
  }, []);

  const showCue = useCallback(
    (nextCue: Cue, sound: () => Promise<void>, duration = 1800) => {
      setCue(nextCue);

      if (cueTimeoutRef.current !== null) {
        window.clearTimeout(cueTimeoutRef.current);
      }

      cueTimeoutRef.current = window.setTimeout(() => setCue(null), duration);

      if (soundEnabled) {
        void sound();
      }
    },
    [soundEnabled],
  );

  useEffect(() => {
    if (!roundId || !phase) {
      previousRoundRef.current = roundId;
      previousPhaseRef.current = phase;
      return;
    }

    const isNewRound = previousRoundRef.current !== roundId;
    const previousPhase = isNewRound ? null : previousPhaseRef.current;

    previousRoundRef.current = roundId;
    previousPhaseRef.current = phase;
    lastCountdownRef.current = null;

    if (isNewRound && phase === "writing") {
      const timeLeft = writingEndsAt
        ? new Date(writingEndsAt).getTime() - Date.now()
        : 60_000;

      if (timeLeft > 48_000) {
        const timeout = window.setTimeout(
          () =>
            showCue(
              {
                kind: "start",
                eyebrow: `Round ${roundNumber ?? ""}`.trim(),
                message: "GO!",
              },
              playRoundStartSound,
            ),
          0,
        );

        return () => window.clearTimeout(timeout);
      }
      return;
    }

    if (previousPhase === "writing" && phase === "voting") {
      const timeout = window.setTimeout(
        () =>
          showCue(
            { kind: "voting", eyebrow: "Time!", message: "VOTE NOW" },
            playVotingSound,
            2200,
          ),
        0,
      );

      return () => window.clearTimeout(timeout);
    }

    if (previousPhase === "voting" && phase === "results") {
      const timeout = window.setTimeout(
        () =>
          showCue(
            {
              kind: "results",
              eyebrow: "Round over",
              message: "RESULTS ARE IN",
            },
            playResultsSound,
            2200,
          ),
        0,
      );

      return () => window.clearTimeout(timeout);
    }
  }, [phase, roundId, roundNumber, showCue, writingEndsAt]);

  useEffect(() => {
    if (!roundId || phase !== "writing" || secondsRemaining === null) {
      return;
    }

    const countdownKey = `${roundId}:${secondsRemaining}`;

    if (lastCountdownRef.current === countdownKey) {
      return;
    }

    lastCountdownRef.current = countdownKey;

    if (secondsRemaining === 10) {
      const timeout = window.setTimeout(
        () =>
          showCue(
            { kind: "warning", eyebrow: "Hurry up", message: "10 SECONDS!" },
            playWarningSound,
            1500,
          ),
        0,
      );

      return () => window.clearTimeout(timeout);
    } else if (secondsRemaining > 0 && secondsRemaining <= 5 && soundEnabled) {
      void playCountdownTickSound();
    }
  }, [phase, roundId, secondsRemaining, showCue, soundEnabled]);

  async function toggleSound() {
    const nextValue = !soundEnabled;
    setSoundEnabled(nextValue);
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(nextValue));

    if (nextValue) {
      await unlockGameAudio();
      await playCountdownTickSound();
    }
  }

  return { cue, soundEnabled, toggleSound };
}

export function GameplayCueOverlay({ cue }: { cue: Cue | null }) {
  if (!cue) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="assertive"
      className={`gameplay-cue gameplay-cue-${cue.kind}`}
    >
      <div className="gameplay-cue-card">
        <p>{cue.eyebrow}</p>
        <strong>{cue.message}</strong>
      </div>
    </div>
  );
}

