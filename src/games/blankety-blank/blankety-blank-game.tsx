"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import Link from "next/link";
import { getOrCreateAnonymousUser, supabase } from "@/lib/supabase";
import { AnswerForm } from "@/components/answer-form";
import {
  VotingForm,
  VotingToResultsBridge,
  WritingToVotingBridge,
} from "@/components/round-voting";
import { RoundResults } from "@/components/round-results";
import { WritingControls } from "@/components/writing-controls";
import { GameFinished } from "@/components/game-finished";
import {
  NextRoundButton,
  type AdvanceResult,
} from "@/components/next-round-button";
import { GameplayCueOverlay, useGameplayCues } from "@/components/gameplay-cues";
import { RoomInvite } from "@/components/room-invite";
import { GameIssueReporter } from "@/components/game-issue-reporter";
import { GameorillaMark } from "@/components/gameorilla-brand";
import { unlockGameAudio } from "@/lib/game-audio";
import { reportClientError } from "@/lib/error-reporting";
import {
  displayRoomCode,
  formatRoomCodeInput,
  makeRoomCode,
  roomCodeFromInput,
} from "@/lib/room-codes.mjs";
type View = "home" | "create" | "join" | "lobby" | "round";
type RealtimeStatus = "connecting" | "connected" | "error";

type PresencePlayer = {
  id: string;
  name: string;
  isPlayer: boolean;
  isHost?: boolean;
};

type RoomResult = {
  room_id: string;
  player_id: string;
  room_code: string;
  room_status: string;
  is_captain?: boolean;
  is_player?: boolean;
};

type RoomState = {
  room_id: string;
  room_code: string;
  room_status: string;
  target_points?: number | null;
  current_round_number?: number | null;
  round_id?: string | null;
  prompt_text?: string | null;
  round_phase?: string | null;
  writing_ends_at?: string | null;
};

type StartedRound = {
  room_id: string;
  room_code: string;
  round_id: string;
  round_number: number;
  prompt_text: string;
  phase: string;
  writing_ends_at: string | null;
};

const SESSION_STORAGE_KEY = "gameorilla-browser-session-id";
const ROOM_STORAGE_KEY = "gameorilla-active-room";
const ROOM_CREATION_ATTEMPTS = 5;
const ANSWER_TIMER_SECONDS = 60;

type SavedRoomSession = {
  roomCode: string;
  name: string;
  isHost: boolean;
  isPlayer: boolean;
};

function saveRoomSession(
  roomCode: string,
  name: string,
  isHost: boolean,
  isPlayer: boolean,
) {  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ROOM_STORAGE_KEY,
    JSON.stringify({
  roomCode,
  name,
  isHost,
  isPlayer,
}),
  );
}

function clearRoomSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ROOM_STORAGE_KEY);
}

function clearInvitationFromUrl() {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);

  if (!url.searchParams.has("room")) {
    return;
  }

  url.searchParams.delete("room");
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function readRoomSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved = window.localStorage.getItem(ROOM_STORAGE_KEY);

    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved) as Partial<SavedRoomSession>;

    if (
      typeof parsed.roomCode !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.isHost !== "boolean" ||
      typeof parsed.isPlayer !== "boolean"
    ) {
      return null;
    }

    return parsed as SavedRoomSession;
  } catch {
    return null;
  }
}
function getBrowserSessionId() {
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);

  return sessionId;
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function isRoomCodeCollision(error: unknown) {
  return getErrorMessage(error).toLowerCase().includes("already taken");
}

function formatCountdown(seconds: number | null) {
  if (seconds === null) {
    return "Waiting for answers";
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}
export default function BlanketyBlankGame() {
  const [view, setView] = useState<View>("home");
  const [name, setName] = useState("");
  const [targetPoints, setTargetPoints] = useState<5 | 10 | 15>(10);
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [players, setPlayers] = useState<PresencePlayer[]>([]);
  const [playerSessionId, setPlayerSessionId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [isPlayerDevice, setIsPlayerDevice] = useState(false);
  const [createAsPlayer, setCreateAsPlayer] = useState(false);
  const [isSavingRoom, setIsSavingRoom] = useState(false);
  const [isStartingRound, setIsStartingRound] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeStatus>("connecting");
  const [currentRound, setCurrentRound] = useState<StartedRound | null>(null);
  const [finishedGame, setFinishedGame] = useState<{
  winnerCount: number;
  winnerScore?: number;
} | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(
    null,
  );

const roomChannelRef = useRef<RealtimeChannel | null>(null);
const syncInProgressRef = useRef(false);

const isGameboardView = !isPlayerDevice && (view === "lobby" || view === "round");

const inRoom = view === "lobby" || view === "round";
const { cue, soundEnabled, toggleSound } = useGameplayCues({
  roundId: currentRound?.round_id ?? null,
  roundNumber: currentRound?.round_number ?? null,
  phase: currentRound?.phase ?? null,
  writingEndsAt: currentRound?.writing_ends_at ?? null,
  secondsRemaining,
});
useEffect(() => {
  const invitedRoom = new URLSearchParams(window.location.search).get("room");
  const invitedRoomCode = invitedRoom ? roomCodeFromInput(invitedRoom) : null;

  if (invitedRoomCode) {
    const timeout = window.setTimeout(() => {
      setJoinCode(displayRoomCode(invitedRoomCode));
      setIsPlayerDevice(true);
      setName("");
      setMessage("");
      setView("join");
      setIsRestoringSession(false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }

  const savedRoom = readRoomSession();

  if (!savedRoom) {
    const timeout = window.setTimeout(() => setIsRestoringSession(false), 0);
    return () => window.clearTimeout(timeout);
  }

  const restoredSession = savedRoom;

  let cancelled = false;

  async function restoreActiveRound() {
    try {
      await getOrCreateAnonymousUser();

      const browserSessionId = getBrowserSessionId();
      const { data: resumeData, error: resumeError } = await supabase.rpc(
        "resume_game_room",
        {
          p_room_code: restoredSession.roomCode,
          p_session_id: browserSessionId,
        },
      );

      if (resumeError) {
        throw resumeError;
      }

      const resumedRoom = (resumeData as RoomResult[] | null)?.[0];

      if (!resumedRoom) {
        throw new Error("The saved room could not be restored.");
      }

      const { data, error } = await supabase.rpc("get_room_game_state", {
        p_room_code: restoredSession.roomCode,
      });

      if (error) {
        throw error;
      }

      const roomState = (data as RoomState[] | null)?.[0];

      if (cancelled || !roomState) {
        return;
      }

      setName(restoredSession.name);
      setRoomCode(restoredSession.roomCode);
      setIsHost(Boolean(resumedRoom.is_captain));
      setIsPlayerDevice(Boolean(resumedRoom.is_player));
      setPlayerSessionId(browserSessionId);
      setView("lobby");

      if (
        roomState.target_points === 5 ||
        roomState.target_points === 10 ||
        roomState.target_points === 15
      ) {
        setTargetPoints(roomState.target_points);
      }

      if (
        roomState.round_id &&
        roomState.prompt_text &&
        roomState.current_round_number &&
        roomState.round_phase
      ) {
        const restoredRound: StartedRound = {
          room_id: roomState.room_id,
          room_code: roomState.room_code,
          round_id: roomState.round_id,
          round_number: roomState.current_round_number,
          prompt_text: roomState.prompt_text,
          phase: roomState.round_phase,
          writing_ends_at: roomState.writing_ends_at ?? null,
        };

        setCurrentRound(restoredRound);
        setView("round");
      }
    } catch (error) {
      console.error("Could not restore active round:", error);
      void reportClientError({
        errorCode: "game.restore_failed",
        phase: "restore",
      });
      clearRoomSession();
    } finally {
      if (!cancelled) {
        setIsRestoringSession(false);
      }
    }
  }

  void restoreActiveRound();

  return () => {
    cancelled = true;
  };
}, []);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  useEffect(() => {
    const playerName = name.trim();

    if (!inRoom || !roomCode || !playerName || !playerSessionId) {
      return;
    }

    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        presence: {
          key: playerSessionId,
        },
      },
    });

    roomChannelRef.current = channel;

    const syncPlayers = () => {
  const currentPlayers = Object.values(
    channel.presenceState<PresencePlayer>(),
  )
  .flat()
  .filter((player) => player.isPlayer !== false);

  const uniquePlayers = Array.from(
    new Map(
      currentPlayers.map((player) => [player.id, player]),
    ).values(),
  );

  setPlayers(uniquePlayers);
};

    channel
      .on("presence", { event: "sync" }, syncPlayers)
      .on("presence", { event: "join" }, syncPlayers)
      .on("presence", { event: "leave" }, syncPlayers)
      .on("broadcast", { event: "round_started" }, ({ payload }) => {
        const receivedRound = payload as StartedRound;

        if (receivedRound?.round_id && receivedRound?.prompt_text) {
          setCurrentRound(receivedRound);
          setView("round");
        }
      })
      .on("broadcast", { event: "game_finished" }, ({ payload }) => {
  const finishedPayload = payload as {
    winnerCount: number;
    winnerScore?: number;
  };

  setFinishedGame(finishedPayload);
})
      .on("broadcast", { event: "room_restarted" }, () => {
        setFinishedGame(null);
        setCurrentRound(null);
        setView("lobby");
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected");

          void channel.track({
            id: playerSessionId,
            name: playerName,
            isPlayer: isPlayerDevice,
            isHost,
          });
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtimeStatus("error");
        }
      });

    return () => {
      if (roomChannelRef.current === channel) {
        roomChannelRef.current = null;
      }

      setPlayers([]);
      void supabase.removeChannel(channel);
    };
  }, [inRoom, name, playerSessionId, roomCode, isPlayerDevice, isHost]);

  useEffect(() => {
    if (!inRoom || !roomCode || !playerSessionId) {
      return;
    }

    let cancelled = false;

    async function syncFromServer() {
      if (cancelled || syncInProgressRef.current || !navigator.onLine) {
        return;
      }

      syncInProgressRef.current = true;

      try {
        await getOrCreateAnonymousUser();

        const [stateResponse, presenceResponse] = await Promise.all([
          supabase.rpc("get_room_game_state", { p_room_code: roomCode }),
          supabase.rpc("touch_room_presence", {
            p_room_code: roomCode,
            p_session_id: playerSessionId,
          }),
        ]);

        if (stateResponse.error) throw stateResponse.error;
        if (presenceResponse.error) throw presenceResponse.error;

        const roomState = (stateResponse.data as RoomState[] | null)?.[0];
        const presenceState = (
          presenceResponse.data as { is_captain: boolean }[] | null
        )?.[0];

        if (cancelled || !roomState) return;

        const nextIsHost = Boolean(presenceState?.is_captain);
        setIsHost(nextIsHost);
        saveRoomSession(roomCode, name, nextIsHost, isPlayerDevice);

        if (roomState.room_status === "lobby") {
          setCurrentRound(null);
          setFinishedGame(null);
          setView("lobby");
          return;
        }

        if (
          roomState.round_id &&
          roomState.prompt_text &&
          roomState.current_round_number &&
          roomState.round_phase
        ) {
          setCurrentRound({
            room_id: roomState.room_id,
            room_code: roomState.room_code,
            round_id: roomState.round_id,
            round_number: roomState.current_round_number,
            prompt_text: roomState.prompt_text,
            phase: roomState.round_phase,
            writing_ends_at: roomState.writing_ends_at ?? null,
          });
          setView("round");
        }

        if (roomState.room_status === "finished" && !finishedGame) {
          const scoreboardResponse = await supabase.rpc("get_room_scoreboard", {
            p_room_code: roomCode,
          });

          if (!scoreboardResponse.error && !cancelled) {
            const scoreboard = (scoreboardResponse.data as {
              score_total: number;
            }[] | null) ?? [];
            const topScore = scoreboard[0]?.score_total;
            const winnerCount = scoreboard.filter(
              (entry) => entry.score_total === topScore,
            ).length;

            setFinishedGame({
              winnerCount: winnerCount || 1,
              winnerScore: topScore,
            });
          }
        }
      } catch (error) {
        console.error("Could not synchronize room:", error);
        void reportClientError({
          errorCode: "game.sync_failed",
          phase: "sync",
        });
      } finally {
        syncInProgressRef.current = false;
      }
    }

    void syncFromServer();
    const interval = window.setInterval(() => void syncFromServer(), 3000);
    window.addEventListener("online", syncFromServer);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("online", syncFromServer);
    };
  }, [finishedGame, inRoom, isPlayerDevice, name, playerSessionId, roomCode]);

  useEffect(() => {
    const writingEndsAt = currentRound?.writing_ends_at ?? "";

if (!writingEndsAt) {
  const timeout = window.setTimeout(() => setSecondsRemaining(null), 0);
  return () => window.clearTimeout(timeout);
}

    function updateCountdown() {
      const remaining = Math.min(
        ANSWER_TIMER_SECONDS,
        Math.max(
          0,
          Math.ceil(
            (new Date(writingEndsAt).getTime() - Date.now()) / 1000,
          ),
        ),
      );

      setSecondsRemaining(remaining);
    }

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 500);

    return () => {
      window.clearInterval(interval);
    };
  }, [currentRound?.writing_ends_at]);

  function startCreateRoom(asPlayer = true) {
    setCreateAsPlayer(asPlayer);
    setName("");
    setMessage("");
    setPlayers([]);
    setCurrentRound(null);
    setIsHost(false);
    setIsPlayerDevice(asPlayer);
    setRoomCode(makeRoomCode());
    setView("create");
  }

  function returnHome() {
    if (inRoom && roomCode && playerSessionId) {
      void supabase.rpc("leave_game_room", {
        p_room_code: roomCode,
        p_session_id: playerSessionId,
      });
    }

    setIsPlayerDevice(false);
    clearRoomSession();
    clearInvitationFromUrl();
    setMessage("");
    setPlayers([]);
    setCurrentRound(null);
    setPlayerSessionId("");
    setIsHost(false);
    setView("home");
  }

  async function restartRoom() {
    if (!isHost || isRestarting) {
      return;
    }

    setIsRestarting(true);
    setMessage("");

    try {
      const { error } = await supabase.rpc("restart_game_room", {
        p_room_code: roomCode,
      });

      if (error) {
        throw error;
      }

      setFinishedGame(null);
      setCurrentRound(null);
      setView("lobby");

      await roomChannelRef.current?.send({
        type: "broadcast",
        event: "room_restarted",
        payload: { roomCode },
      });
    } catch (error) {
      void reportClientError({
        errorCode: "game.restart_failed",
        phase: "restart",
      });
      setMessage(getErrorMessage(error));
    } finally {
      setIsRestarting(false);
    }
  }

  async function createRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void unlockGameAudio();

    const playerName = createAsPlayer ? name.trim() : "Gameboard Screen";

    if (!playerName) {
      setMessage("Give yourself a name first.");
      return;
    }

    setIsSavingRoom(true);
    setMessage("");

    try {
      await getOrCreateAnonymousUser();

      const browserSessionId = getBrowserSessionId();

      let createdRoom: RoomResult | undefined;
      let candidateCode = roomCode;

      for (let attempt = 0; attempt < ROOM_CREATION_ATTEMPTS; attempt += 1) {
        if (attempt > 0) {
          candidateCode = makeRoomCode();
        }

        const { data, error } = await supabase.rpc("create_game_room_guarded", {
          p_code: candidateCode,
          p_display_name: playerName,
          p_session_id: browserSessionId,
          p_victory_mode: "first_to",
          p_rounds_to_play: null,
          p_answer_end_mode: "timer",
          p_target_points: targetPoints,
          p_win_by: 1,
          p_answer_timer_seconds: ANSWER_TIMER_SECONDS,
          p_is_player: createAsPlayer,
        });

        if (!error) {
          createdRoom = (data as RoomResult[] | null)?.[0];
          break;
        }

        if (!isRoomCodeCollision(error) || attempt === ROOM_CREATION_ATTEMPTS - 1) {
          throw error;
        }
      }

      if (!createdRoom) {
        throw new Error("The room was not created. Please try again.");
      }

      setPlayerSessionId(browserSessionId);
setName(playerName);
setRoomCode(createdRoom.room_code);
setIsHost(createAsPlayer);
setIsPlayerDevice(createAsPlayer);
saveRoomSession(
  createdRoom.room_code,
  playerName,
  createAsPlayer,
  createAsPlayer,
);
setView("lobby");
    } catch (error) {
      void reportClientError({
        errorCode: "game.create_failed",
        phase: "create",
      });
      setMessage(getErrorMessage(error));
    } finally {
      setIsSavingRoom(false);
    }
  }

  async function joinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void unlockGameAudio();

    const playerName = isPlayerDevice ? name.trim() : "Gameboard Screen";
    const formattedCode = roomCodeFromInput(joinCode);

    if (isPlayerDevice && !playerName) {
  setMessage("Give yourself a name first.");
  return;
}

    if (!formattedCode) {
      setMessage("Enter the full two-word room name.");
      return;
    }

    setIsSavingRoom(true);
    setMessage("");

    try {
      await getOrCreateAnonymousUser();

      const browserSessionId = getBrowserSessionId();

      const { data, error } = await supabase.rpc("join_game_room", {
  p_code: formattedCode,
  p_display_name: playerName,
  p_session_id: browserSessionId,
  p_is_player: isPlayerDevice,
});

      if (error) {
        throw error;
      }

      const joinedRoom = (data as RoomResult[] | null)?.[0];

      if (!joinedRoom) {
        throw new Error("Could not join that room. Please try again.");
      }
const { data: settingsData, error: settingsError } = await supabase.rpc(
  "get_room_settings",
  {
    p_room_code: joinedRoom.room_code,
  },
);

if (settingsError) {
  throw settingsError;
}

const roomSettings = (
  settingsData as {
  target_points?: number;
}[] | null
)?.[0];

if (
  roomSettings?.target_points === 5 ||
  roomSettings?.target_points === 10 ||
  roomSettings?.target_points === 15
) {
  setTargetPoints(roomSettings.target_points);
}
      setPlayerSessionId(browserSessionId);
setName(playerName);
setRoomCode(joinedRoom.room_code);
setIsHost(Boolean(joinedRoom.is_captain));
setIsPlayerDevice(isPlayerDevice);
saveRoomSession(
  joinedRoom.room_code,
  playerName,
  Boolean(joinedRoom.is_captain),
  isPlayerDevice,
);
clearInvitationFromUrl();
setView("lobby");
    } catch (error) {
      void reportClientError({
        errorCode: "game.join_failed",
        phase: "join",
      });
      setMessage(getErrorMessage(error));
    } finally {
      setIsSavingRoom(false);
    }
  }

  async function startRoundOne() {
    if (!isHost) {
      return;
    }

    if (players.length < 3) {
      setMessage("You need at least three players before starting.");
      return;
    }

    void unlockGameAudio();

    setIsStartingRound(true);
    setMessage("");

    try {
      await getOrCreateAnonymousUser();

      const { data, error } = await supabase.rpc("start_first_round", {
        p_room_code: roomCode,
      });

      if (error) {
        throw error;
      }

      const startedRound = (data as StartedRound[] | null)?.[0];

      if (!startedRound) {
        throw new Error("The first round did not start. Please try again.");
      }

      await roomChannelRef.current?.send({
        type: "broadcast",
        event: "round_started",
        payload: startedRound,
      });

      setCurrentRound(startedRound);
      setView("round");
    } catch (error) {
      void reportClientError({
        errorCode: "game.start_failed",
        phase: "start",
      });
      setMessage(getErrorMessage(error));
    } finally {
      setIsStartingRound(false);
    }
  }

  return (
    <main className={`bg-[#F3F6FF] text-[#04050A] ${isGameboardView ? "h-[100dvh] overflow-hidden px-4 py-4" : "min-h-screen px-6 py-8 sm:px-10 lg:px-16"}`}>
      <div className={`mx-auto flex max-w-6xl flex-col ${isGameboardView ? "h-full" : "min-h-[calc(100vh-4rem)]"}`}>
        {isRestoringSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F3F6FF]">
            <div className="rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] px-8 py-6 text-center shadow-[6px_6px_0_#04050A]">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#FF5E78]">
                Gameorilla
              </p>
              <p className="mt-2 text-xl font-black">Checking for your active room…</p>
            </div>
          </div>
        )}

        <GameplayCueOverlay cue={cue} />
        {!isGameboardView && (
          <GameIssueReporter
            roomCode={roomCode || joinCode}
            phase={currentRound?.phase ?? view}
          />
        )}

        {inRoom && (!isOnline || realtimeStatus === "error") && (
          <div
            role="status"
            className="mb-3 shrink-0 rounded-xl border-2 border-[#04050A] bg-[#FF3EA8] px-4 py-3 text-center font-black"
          >
            {!isOnline
              ? "You’re offline. We’ll reconnect automatically."
              : "Reconnecting to the room…"}
          </div>
        )}

        <header className={`shrink-0 ${isGameboardView ? "flex items-center justify-between pb-3" : "flex items-center justify-between"}`}>
          {view === "home" ? (
            <Link
              href="/"
              className="text-left text-2xl font-black tracking-[-0.08em] sm:text-3xl"
            >
              <span className="inline-flex items-center gap-2">
                <GameorillaMark className="h-8 w-8" />
                <span>gameorilla</span>
              </span>
            </Link>
          ) : (
            <button
              onClick={returnHome}
              className="text-left text-2xl font-black tracking-[-0.08em] sm:text-3xl"
            >
              <span className="inline-flex items-center gap-2">
                <GameorillaMark className="h-8 w-8" />
                <span>gameorilla</span>
              </span>
            </button>
          )}

          <div className="flex items-center gap-3">
            {inRoom && (
              <button
                type="button"
                onClick={() => void toggleSound()}
                aria-pressed={soundEnabled}
                className="rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] px-3 py-2 text-xs font-black uppercase tracking-[0.08em] transition hover:bg-[#FF3EA8]"
              >
                {soundEnabled ? "Sound on" : "Sound off"}
              </button>
            )}
            <p className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-[#04050A] sm:block">
              Fill in the Blank
            </p>
          </div>
        </header>

        {view === "home" && (
          <section className="flex flex-1 flex-col justify-center py-16 lg:py-24">
            <p className="mb-5 w-fit rounded-full border-2 border-[#04050A] bg-[#FF3EA8] px-4 py-2 text-sm font-black uppercase tracking-[0.12em]">
              A Gameorilla game
            </p>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.07em] sm:text-7xl lg:text-8xl">
              Fill in the blank.
              <br />
              <span className="text-[#FF5E78]">Vote for the chaos.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#04050A] sm:text-xl">
              Fill in the Blank is the write-and-vote party game where everyone
              finishes the prompt and the room picks the funniest answer.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
  <button
    type="button"
    onClick={() => startCreateRoom(true)}
    className="rounded-2xl border-2 border-[#04050A] bg-[#04050A] px-7 py-6 text-xl font-black text-[#F3F6FF] transition hover:-translate-y-1 hover:shadow-[6px_6px_0_#FF5E78]"
  >
    Create a room
    <span className="mt-2 block text-sm font-bold text-[#F3F6FF]">
      Get a funny two-word room name.
    </span>
  </button>

  <button
    type="button"
    onClick={() => {
  setIsPlayerDevice(true);
  setName("");
  setJoinCode("");
  setMessage("");
  setPlayers([]);
  setCurrentRound(null);
  setView("join");
}}
    className="rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] px-7 py-6 text-xl font-black transition hover:-translate-y-1 hover:bg-[#F3F6FF] hover:shadow-[6px_6px_0_#04050A]"
  >
    Join a room
    <span className="mt-2 block text-sm font-bold text-[#04050A]">
      Enter an existing room name.
    </span>
  </button>
</div>
              <p className="mt-4 text-sm font-medium text-[#04050A]">
              No download. No permanent account. Ages 13+. Player answers are not filtered.
          </p>
          </section>
        )}

        {view === "create" && (
          <section className={`flex flex-1 items-center justify-center ${isGameboardView ? "min-h-0 py-0" : "py-12"}`}>
            <form
              onSubmit={createRoom}
              className="w-full max-w-xl rounded-[2rem] border-2 border-[#04050A] bg-[#F3F6FF] p-7 shadow-[8px_8px_0_#04050A] sm:p-10"
            >
              <button
                type="button"
                onClick={returnHome}
                className="mb-8 text-sm font-black uppercase tracking-[0.12em] underline"
              >
                ← Back
              </button>

              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#FF5E78]">
                You are el capitan
              </p>

              <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.06em] sm:text-5xl">
                Start a room.
              </h1>

              <div className="mt-8 rounded-2xl border-2 border-[#04050A] bg-[#FF3EA8] p-5 text-center">
                <p className="text-xs font-black uppercase tracking-[0.14em]">
                  Your room name
                </p>
                <p className="mt-2 text-4xl font-black tracking-[-0.04em]">
                  {displayRoomCode(roomCode)}
                </p>
              </div>
<div className="mt-7">
  <p className="text-sm font-black uppercase tracking-[0.14em]">
    What is this device?
  </p>

  <div className="mt-3 grid gap-3 sm:grid-cols-2">
    <button
      type="button"
      onClick={() => {
        setCreateAsPlayer(false);
        setIsPlayerDevice(false);
        setName("");
      }}
      className={`rounded-xl border-2 border-[#04050A] px-4 py-4 text-left font-black transition ${
        !createAsPlayer
          ? "bg-[#ffca3a] shadow-[4px_4px_0_#04050A]"
          : "bg-[#F3F6FF] hover:bg-[#F3F6FF]"
      }`}
    >
      Use as gameboard
      <span className="mt-1 block text-sm font-bold text-[#04050A]">
        Passive shared screen. Does not play.
      </span>
    </button>

    <button
      type="button"
      onClick={() => {
        setCreateAsPlayer(true);
        setIsPlayerDevice(true);
      }}
      className={`rounded-xl border-2 border-[#04050A] px-4 py-4 text-left font-black transition ${
        createAsPlayer
          ? "bg-[#ffca3a] shadow-[4px_4px_0_#04050A]"
          : "bg-[#F3F6FF] hover:bg-[#F3F6FF]"
      }`}
    >
      Play on this device
      <span className="mt-1 block text-sm font-bold text-[#04050A]">
        This device becomes Player 1.
      </span>
    </button>
  </div>
</div>

<div className="mt-7">
  <p className="text-sm font-black uppercase tracking-[0.14em]">
    Pick the banana stack
  </p>

  <div className="mt-3 grid grid-cols-3 gap-3">
    {([5, 10, 15] as const).map((pointOption) => (
      <button
        key={pointOption}
        type="button"
        onClick={() => setTargetPoints(pointOption)}
        className={`rounded-xl border-2 border-[#04050A] px-4 py-3 font-black transition ${
          targetPoints === pointOption
            ? "bg-[#FF3EA8] shadow-[4px_4px_0_#04050A]"
            : "bg-[#F3F6FF] hover:bg-[#FF3EA8]/35"
        }`}
      >
        {pointOption}
        <span className="block text-xs uppercase tracking-[0.12em]">
          bananas
        </span>
      </button>
    ))}
  </div>
  <p className="mt-3 text-sm font-bold text-[#04050A]/70">
    First solo player to the stack wins. Ten bananas is the house game.
  </p>
</div>

              {createAsPlayer && (
  <>
    <label className="mt-7 block text-sm font-black uppercase tracking-[0.14em]">
      What should everyone call you?
    </label>

    <input
      autoFocus
      value={name}
      onChange={(event) => setName(event.target.value)}
      placeholder="Your name"
      maxLength={24}
      className="mt-2 w-full rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] px-4 py-4 text-xl font-bold outline-none focus:shadow-[4px_4px_0_#04050A]"
    />
  </>
)}
              {message && (
                <p className="mt-3 font-bold text-[#FF5E78]">{message}</p>
              )}

              <button
                type="submit"
                disabled={isSavingRoom}
                className="mt-7 w-full rounded-2xl border-2 border-[#04050A] bg-[#04050A] px-7 py-4 text-lg font-black text-[#F3F6FF] transition hover:-translate-y-1 hover:bg-[#FF5E78] disabled:cursor-wait disabled:opacity-60"
              >
                {isSavingRoom ? "Opening room…" : "Open this room"}
              </button>
            </form>
          </section>
        )}

        {view === "join" && (
          <section className="flex flex-1 items-center justify-center py-12">
            <form
              onSubmit={joinRoom}
              className="w-full max-w-xl rounded-[2rem] border-2 border-[#04050A] bg-[#F3F6FF] p-7 shadow-[8px_8px_0_#04050A] sm:p-10"
            >
              <button
                type="button"
                onClick={returnHome}
                className="mb-8 text-sm font-black uppercase tracking-[0.12em] underline"
              >
                ← Back
              </button>

              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#FF5E78]">
                Somebody invited you
              </p>

              <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.06em] sm:text-5xl">
                Join the nonsense.
              </h1>

              <div>
  <p className="text-sm font-black uppercase tracking-[0.14em]">
    What is this device?
  </p>

  <div className="mt-3 grid gap-3 sm:grid-cols-2">
    <button
      type="button"
      onClick={() => {
        setIsPlayerDevice(false);
        setName("");
      }}
      className={`rounded-xl border-2 border-[#04050A] px-4 py-4 text-left font-black transition ${
        !isPlayerDevice
          ? "bg-[#ffca3a] shadow-[4px_4px_0_#04050A]"
          : "bg-[#F3F6FF] hover:bg-[#F3F6FF]"
      }`}
    >
      Use as gameboard
      <span className="mt-1 block text-sm font-bold text-[#04050A]">
        Passive shared screen. Does not play.
      </span>
    </button>

    <button
      type="button"
      onClick={() => setIsPlayerDevice(true)}
      className={`rounded-xl border-2 border-[#04050A] px-4 py-4 text-left font-black transition ${
        isPlayerDevice
          ? "bg-[#ffca3a] shadow-[4px_4px_0_#04050A]"
          : "bg-[#F3F6FF] hover:bg-[#F3F6FF]"
      }`}
    >
      Play on this device
      <span className="mt-1 block text-sm font-bold text-[#04050A]">
        Enter a name and join as a player.
      </span>
    </button>
  </div>
</div>

{isPlayerDevice && (
  <>
    <label className="mt-7 block text-sm font-black uppercase tracking-[0.14em]">
      Your name
    </label>

    <input
      autoFocus
      value={name}
      onChange={(event) => setName(event.target.value)}
      placeholder="Your name"
      maxLength={24}
      className="mt-2 w-full rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] px-4 py-4 text-xl font-bold outline-none focus:shadow-[4px_4px_0_#04050A]"
    />
  </>
)}

              <label className="mt-5 block text-sm font-black uppercase tracking-[0.12em]">
                Room name
              </label>

              <input
                value={joinCode}
                onChange={(event) =>
                  setJoinCode(formatRoomCodeInput(event.target.value))
                }
                placeholder="happy dog"
                maxLength={13}
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                className="mt-2 w-full rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] px-4 py-4 text-lg font-black outline-none placeholder:font-bold placeholder:text-[#8D46FF] focus:bg-[#F3F6FF]"
              />

              {message && (
                <p className="mt-3 font-bold text-[#FF5E78]">{message}</p>
              )}

              <button
                type="submit"
                disabled={isSavingRoom}
                className="mt-7 w-full rounded-2xl border-2 border-[#04050A] bg-[#04050A] px-7 py-4 text-lg font-black text-[#F3F6FF] transition hover:-translate-y-1 hover:bg-[#FF5E78] disabled:cursor-wait disabled:opacity-60"
              >
                {isSavingRoom ? "Joining room…" : "Join the room"}
              </button>
            </form>
          </section>
        )}

        {view === "lobby" && (
          <section className="flex flex-1 items-center justify-center py-12">
            <div className={`w-full rounded-[2rem] border-2 border-[#04050A] bg-[#F3F6FF] shadow-[8px_8px_0_#04050A] ${isGameboardView ? "flex h-full max-h-full max-w-6xl flex-col overflow-hidden p-5" : "max-w-3xl p-8"}`}>
              <div className={`flex shrink-0 flex-col sm:flex-row sm:items-start sm:justify-between ${isGameboardView ? "gap-3" : "gap-5"}`}>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#FF5E78]">
                    Live room
                  </p>
                  <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] sm:text-5xl">
                    Room is open.
                  </h1>
                </div>

                <button
                  onClick={returnHome}
                  className="rounded-xl border-2 border-[#04050A] px-4 py-2 text-sm font-black transition hover:bg-[#FF3EA8]"
                >
                  Leave room
                </button>
              </div>

              <div className={`grid gap-5 md:grid-cols-3 ${isGameboardView ? "mt-4 shrink-0" : "mt-8"}`}>
                <div className="rounded-2xl border-2 border-[#04050A] bg-[#FF3EA8] p-6">
                  <p className="text-xs font-black uppercase tracking-[0.14em]">
                    Room name
                  </p>
                  <p className="mt-3 text-4xl font-black leading-none tracking-[-0.05em]">
                    {displayRoomCode(roomCode)}
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] p-6">
                  <p className="text-xs font-black uppercase tracking-[0.14em]">
                    Game setup
                  </p>
                  <p className="mt-3 text-2xl font-black">
  First to {targetPoints} bananas
</p>
                  <p className="mt-1 font-semibold text-[#04050A]">
  60 seconds to answer each prompt.
</p>
                </div>

                <div className="flex items-center justify-center rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] p-4">
                  <RoomInvite roomCode={roomCode} compact={isGameboardView} />
                </div>
              </div>

              <div className={`rounded-2xl border-2 border-[#04050A] p-5 ${isGameboardView ? "mt-4 min-h-0 flex-1 overflow-hidden" : "mt-8"}`}>
                <p className="text-sm font-black uppercase tracking-[0.12em]">
                  In this room
                </p>

                {players.length > 0 ? (
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {players.map((player) => (
                      <li
                        key={player.id}
                        className="rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] px-4 py-3 text-lg font-black"
                      >
                        {player.name}
                        {player.id === playerSessionId ? " (you)" : ""}
                        {player.isHost ? " · captain" : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 font-semibold text-[#04050A]">
                    Waiting for the first troublemaker...
                  </p>
                )}
              </div>

              {message && (
                <p className="mt-5 font-bold text-[#FF5E78]">{message}</p>
              )}

              <div className="mt-7">
                {isHost ? (
                  <>
                    <button
                      onClick={startRoundOne}
                      disabled={
                        isStartingRound || realtimeStatus !== "connected" || players.length < 3
                      }
                      className="w-full rounded-2xl border-2 border-[#04050A] bg-[#04050A] px-7 py-4 text-lg font-black text-[#F3F6FF] transition hover:-translate-y-1 hover:bg-[#FF5E78] disabled:cursor-wait disabled:opacity-60"
                    >
                      {players.length < 3
                        ? `Waiting for ${3 - players.length} more`
                        : isStartingRound
                          ? "Starting round…"
                          : "Start round one"}
                    </button>

                    <p className="mt-3 text-center text-sm font-semibold text-[#04050A]">
                      Three players is the minimum. Invite the crew before you start.
                    </p>
                  </>
                ) : (
                  <p className="rounded-2xl border-2 border-dashed border-[#04050A] px-6 py-5 text-center font-bold text-[#04050A]">
                    Waiting for the captain to start round one...
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {view === "round" && currentRound && (
          <section className={`flex flex-1 items-center justify-center ${isGameboardView ? "min-h-0 py-0" : "py-12"}`}>
            <div className={`w-full rounded-[2rem] border-2 border-[#04050A] bg-[#F3F6FF] shadow-[8px_8px_0_#04050A] ${isGameboardView ? "flex h-full max-h-full max-w-6xl flex-col overflow-hidden p-5" : "max-w-4xl p-8"}`}>
              <div className={`flex shrink-0 flex-col border-b-2 border-[#04050A] sm:flex-row sm:items-start sm:justify-between ${isGameboardView ? "gap-3 pb-3" : "gap-5 pb-5"}`}>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#FF5E78]">
                    Round {currentRound.round_number} · first to {targetPoints} bananas
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#04050A]">
                    Fill in the blank before time runs out.
                  </p>
                </div>

                <div
                  className={`w-fit rounded-2xl border-2 border-[#04050A] px-5 py-3 text-3xl font-black tabular-nums ${
                    currentRound.phase === "writing" &&
                    secondsRemaining !== null &&
                    secondsRemaining <= 10
                      ? "round-timer-warning bg-[#FF5E78] text-[#F3F6FF]"
                      : "bg-[#FF3EA8]"
                  }`}
                >
                  {currentRound.phase === "writing"
                    ? formatCountdown(secondsRemaining)
                    : currentRound.phase === "voting"
                      ? "VOTE"
                      : "RESULTS"}
                </div>
              </div>

              {!(finishedGame && isGameboardView) && (
              <div className={`flex min-h-0 flex-1 flex-col justify-center ${isGameboardView ? "py-4" : "py-12"}`}>
                <p className="mb-5 text-sm font-black uppercase tracking-[0.14em] text-[#FF5E78]">
                  Your prompt
                </p>

                <h1 className={`${isGameboardView ? "max-w-none text-[clamp(2.25rem,5.4vw,4.75rem)] leading-[0.98]" : "max-w-3xl text-4xl leading-[0.98] sm:text-5xl"} font-black`}>
                  {currentRound.prompt_text}
                </h1>
              </div>
              )}

              <>
<></>
  <WritingToVotingBridge
    roomCode={roomCode}
    roundId={currentRound.round_id}
    phase={currentRound.phase}
    secondsRemaining={secondsRemaining}
    onVotingOpen={() => {
      setCurrentRound((previousRound) =>
        previousRound?.round_id === currentRound.round_id
          ? { ...previousRound, phase: "voting" }
          : previousRound,
      );
    }}
  />

  <VotingToResultsBridge
    roomCode={roomCode}
    roundId={currentRound.round_id}
    phase={currentRound.phase}
    onResultsOpen={() => {
      setCurrentRound((previousRound) =>
        previousRound?.round_id === currentRound.round_id
          ? { ...previousRound, phase: "results" }
          : previousRound,
      );
    }}
  />

  {currentRound.phase === "writing" ? (
   <>
  {isPlayerDevice ? (
  <AnswerForm
    key={currentRound.round_id}
    roomCode={roomCode}
    roundId={currentRound.round_id}
    isTimeUp={secondsRemaining === 0}
  />
) : (
  <div className="mt-2 rounded-2xl border-2 border-dashed border-[#04050A] p-4 text-center">
  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#FF5E78]">
    Gameboard
  </p>
  <h2 className="mt-2 text-[clamp(1.75rem,4vw,3.75rem)] font-black leading-none">
    Players are answering
  </h2>
  <p className="mt-2 text-lg font-semibold text-[#04050A]">
    Keep this screen where everyone can see it.
  </p>
</div>
)}

  <WritingControls
    key={currentRound.round_id}
    roomCode={roomCode}
    roundId={currentRound.round_id}
    phase={currentRound.phase}
    isHost={isHost}
    onVotingOpen={() => {
      setCurrentRound((previousRound) =>
        previousRound?.round_id === currentRound.round_id
          ? { ...previousRound, phase: "voting" }
          : previousRound,
      );
    }}
  />
</>
  ) : currentRound.phase === "voting" ? (
    isPlayerDevice ? (
  <VotingForm
    roomCode={roomCode}
    roundId={currentRound.round_id}
  />
) : (
  <div className="mt-2 rounded-2xl border-2 border-dashed border-[#04050A] p-4 text-center">
  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#FF5E78]">
    Gameboard
  </p>
  <h2 className="mt-2 text-[clamp(1.75rem,4vw,3.75rem)] font-black leading-none">
    Players are voting
  </h2>
  <p className="mt-2 text-lg font-semibold text-[#04050A]">
    Waiting for everyone to pick their favorite answer.
  </p>
</div>
)
  ) : (
  <>
    <RoundResults
  roomCode={roomCode}
  roundId={currentRound.round_id}
  isGameboardView={isGameboardView}
  canReport={isPlayerDevice}
/>
{finishedGame ? (
  <GameFinished
    winnerCount={finishedGame.winnerCount}
    winnerScore={finishedGame.winnerScore}
    isHost={isHost}
    isRestarting={isRestarting}
    isGameboardView={isGameboardView}
    onPlayAgain={restartRoom}
    onBackToHome={() => {
      setFinishedGame(null);
      returnHome();
    }}
  />
) : (
    <NextRoundButton
      roomCode={roomCode}
      isHost={isHost}
      onAdvanced={async (result: AdvanceResult) => {
        if (result.action === "finished") {
  const finishedPayload = {
    winnerCount: result.winner_player_ids?.length ?? 1,
    winnerScore: result.winner_score,
  };

  await roomChannelRef.current?.send({
    type: "broadcast",
    event: "game_finished",
    payload: finishedPayload,
  });

  setFinishedGame(finishedPayload);
  return;
}

        const nextRound: StartedRound = {
          room_id: result.room_id,
          room_code: result.room_code,
          round_id: result.round_id!,
          round_number: result.round_number!,
          prompt_text: result.prompt_text!,
          phase: result.phase ?? "writing",
          writing_ends_at: result.writing_ends_at ?? null,
        };

        await roomChannelRef.current?.send({
          type: "broadcast",
          event: "round_started",
          payload: nextRound,
        });

        setCurrentRound(nextRound);
      }}
    />
    )}
  </>
)}
</>
            </div>
          </section>
        )}

        <footer className={`border-t-2 border-[#04050A] pt-5 text-sm font-semibold text-[#04050A] ${isGameboardView ? "hidden" : ""}`}>
          <nav aria-label="Site information" className="flex flex-wrap gap-x-5 gap-y-3 font-black text-[#04050A]">
            <Link href="/how-to-play">How to play</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/support">Support</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>A Gameorilla game.</span>
            <span>Ages 13+. Player answers are not filtered.</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
