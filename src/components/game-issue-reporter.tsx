"use client";

import { useState, type FormEvent } from "react";
import { getOrCreateAnonymousUser, supabase } from "@/lib/supabase";

function errorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "We could not send that report. Please try again.";
}

export function GameIssueReporter({
  roomCode,
  phase,
}: {
  roomCode?: string;
  phase?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ageConfirmed) {
      setStatus("Please confirm that you are at least 13.");
      return;
    }

    setSending(true);
    setStatus("");

    try {
      await getOrCreateAnonymousUser();

      const context = [
        `Page: ${window.location.pathname}`,
        roomCode ? `Room: ${roomCode}` : null,
        phase ? `Phase: ${phase}` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      const { data, error } = await supabase.rpc("submit_support_request", {
        p_reply_email: email,
        p_category: "game_problem",
        p_message: `${context}\n\n${message}`,
      });

      if (error) {
        throw error;
      }

      const result = (
        data as { request_id: string; created_at: string }[] | null
      )?.[0];

      if (!result?.request_id) {
        throw new Error("Support did not return a request number.");
      }

      setSent(true);
      setStatus(`Sent. Reference ${result.request_id.slice(0, 8).toUpperCase()}.`);
    } catch (error) {
      setStatus(errorMessage(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <aside className="fixed bottom-4 right-4 z-[90] flex max-w-[calc(100vw-2rem)] flex-col items-end">
      {open && (
        <div className="mb-3 w-[22rem] max-w-full rounded-3xl border-[3px] border-[#04050A] bg-[#F3F6FF] p-5 text-[#04050A] shadow-[8px_8px_0_#04050A]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#FF5E78]">
                The crew has your back
              </p>
              <h2 className="mt-1 text-2xl font-black">Something went wrong?</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close problem reporter"
              className="rounded-full bg-[#04050A] px-3 py-1.5 font-black text-[#F3F6FF]"
            >
              ×
            </button>
          </div>

          {sent ? (
            <div role="status" className="mt-5 rounded-2xl bg-[#FF3EA8] p-4 font-bold">
              {status}
            </div>
          ) : (
            <form onSubmit={submit} className="mt-5">
              <label htmlFor="game-issue-message" className="text-sm font-black">
                Tell us what happened
              </label>
              <textarea
                id="game-issue-message"
                required
                minLength={10}
                maxLength={1200}
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="What did you expect, and what happened instead?"
                className="mt-2 w-full resize-y rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] px-4 py-3 font-semibold outline-none placeholder:text-[#8D46FF] focus:shadow-[3px_3px_0_#FF3EA8]"
              />

              <label htmlFor="game-issue-email" className="mt-4 block text-sm font-black">
                Reply email
              </label>
              <input
                id="game-issue-email"
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] px-4 py-3 font-semibold outline-none focus:shadow-[3px_3px_0_#FF3EA8]"
              />

              <label className="mt-4 flex items-start gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(event) => setAgeConfirmed(event.target.checked)}
                  className="mt-0.5 h-5 w-5 accent-[#27E7E2]"
                />
                <span>I confirm that I am at least 13.</span>
              </label>

              {status && (
                <p role="alert" className="mt-3 font-bold text-[#FF5E78]">
                  {status}
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-2xl border-2 border-[#04050A] px-4 py-3 font-black hover:bg-[#FF3EA8]"
                >
                  Reload game
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-2xl bg-[#27E7E2] px-4 py-3 font-black text-[#04050A] hover:bg-[#8D46FF] hover:text-[#F3F6FF] disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send report"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full border-[3px] border-[#04050A] bg-[#FF3EA8] px-5 py-3 text-sm font-black text-[#04050A] shadow-[4px_4px_0_#04050A] transition hover:-translate-y-0.5"
      >
        {open ? "Close help" : "Something wrong?"}
      </button>
    </aside>
  );
}
