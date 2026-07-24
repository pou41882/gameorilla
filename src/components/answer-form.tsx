"use client";

import { useState, type FormEvent } from "react";
import { getOrCreateAnonymousUser, supabase } from "@/lib/supabase";
import { reportClientError } from "@/lib/error-reporting";

type AnswerResult = {
  answer_id: string;
  round_id: string;
  answer_text: string;
  submitted_at: string;
  round_phase: string;
  answers_received: number;
  players_expected: number;
};

type AnswerFormProps = {
  roomCode: string;
  roundId: string;
  isTimeUp: boolean;
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

  return "Could not save your answer. Try again.";
}

export function AnswerForm({
  roomCode,
  isTimeUp,
}: AnswerFormProps) {
  const [answerText, setAnswerText] = useState("");
  const [savedAnswer, setSavedAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedAnswer = answerText.trim();

    if (!cleanedAnswer) {
      setMessage("You need to write something first.");
      return;
    }

    if (isTimeUp) {
      setMessage("Time is up.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      await getOrCreateAnonymousUser();

      const { data, error } = await supabase.rpc("submit_round_answer", {
        p_room_code: roomCode,
        p_answer_text: cleanedAnswer,
      });

      if (error) {
        throw error;
      }

      const result = (data as AnswerResult[] | null)?.[0];

      if (!result) {
        throw new Error("Your answer was not saved.");
      }

      setSavedAnswer(result.answer_text);
      setAnswerText(result.answer_text);
      setMessage("Locked in. You can still revise it before time runs out.");
    } catch (error) {
      void reportClientError({
        errorCode: "game.answer_save_failed",
        phase: "answer",
      });
      setMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={submitAnswer}
      className="rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] p-5"
    >
      <div className="flex items-end justify-between gap-4">
        <label className="text-sm font-black uppercase tracking-[0.12em]">
          Fill in the blank
        </label>

        <span className="text-sm font-bold text-[#04050A]">
          {answerText.length}/180
        </span>
      </div>

      <textarea
        value={answerText}
        onChange={(event) => setAnswerText(event.target.value)}
        placeholder="Say something devastatingly funny..."
        maxLength={180}
        disabled={isTimeUp || isSaving}
        rows={4}
        className="mt-3 w-full resize-none rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] px-4 py-3 text-lg font-bold outline-none placeholder:font-medium placeholder:text-[#8D46FF] focus:bg-[#F3F6FF] disabled:cursor-not-allowed disabled:bg-[#e5ded0]"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-[#04050A]">
          {isTimeUp
            ? savedAnswer
              ? "Time is up. Your answer is saved."
              : "Time is up. No more answers."
            : message || "Only you can see your answer right now."}
        </p>

        <button
          type="submit"
          disabled={isTimeUp || isSaving}
          className="rounded-xl border-2 border-[#04050A] bg-[#04050A] px-5 py-3 font-black text-[#F3F6FF] transition hover:bg-[#FF5E78] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving
            ? "Saving…"
            : savedAnswer
              ? "Update answer"
              : "Lock it in"}
        </button>
      </div>
    </form>
  );
}

