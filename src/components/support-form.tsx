"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getOrCreateAnonymousUser, supabase } from "@/lib/supabase";

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Your request could not be sent. Please try again.";
}

export function SupportForm() {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("game_problem");
  const [message, setMessage] = useState("");
  const [isConfirmedAge, setIsConfirmedAge] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isConfirmedAge) {
      setStatus("Confirm that you are at least 13 years old.");
      return;
    }

    setIsSending(true);
    setStatus("");

    try {
      await getOrCreateAnonymousUser();

      const { data, error } = await supabase.rpc("submit_support_request", {
        p_reply_email: email,
        p_category: category,
        p_message: message,
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
      setStatus(`Request received. Reference: ${result.request_id.slice(0, 8).toUpperCase()}`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="rounded-2xl border-2 border-[#04050A] bg-[#FF3EA8] p-7 shadow-[5px_5px_0_#04050A]">
        <h2 className="text-2xl font-black">We received it.</h2>
        <p className="mt-3 font-bold text-[#04050A]">{status}</p>
        <p className="mt-2 font-semibold text-[#04050A]">Keep this reference if you need to follow up.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submitRequest} className="rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] p-6 shadow-[5px_5px_0_#04050A] sm:p-8">
      <label className="block text-sm font-black uppercase tracking-[0.12em]" htmlFor="support-email">
        Reply email
      </label>
      <input
        id="support-email"
        type="email"
        autoComplete="email"
        required
        maxLength={254}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mt-2 w-full rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] px-4 py-3 font-bold outline-none focus:shadow-[3px_3px_0_#04050A]"
      />

      <label className="mt-6 block text-sm font-black uppercase tracking-[0.12em]" htmlFor="support-category">
        What is this about?
      </label>
      <select
        id="support-category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        className="mt-2 w-full rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] px-4 py-3 font-bold outline-none focus:shadow-[3px_3px_0_#04050A]"
      >
        <option value="game_problem">Game problem</option>
        <option value="safety">Safety or player conduct</option>
        <option value="privacy">Privacy or deletion request</option>
        <option value="feedback">Feedback or idea</option>
        <option value="other">Something else</option>
      </select>

      <div className="mt-6 flex items-end justify-between gap-4">
        <label className="text-sm font-black uppercase tracking-[0.12em]" htmlFor="support-message">
          Message
        </label>
        <span className="text-sm font-bold text-[#04050A]">{message.length}/2000</span>
      </div>
      <textarea
        id="support-message"
        required
        minLength={10}
        maxLength={2000}
        rows={7}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="For game problems, include the room name, device, phase, visible message, and what happened."
        className="mt-2 w-full resize-y rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] px-4 py-3 font-semibold outline-none placeholder:text-[#746b60] focus:shadow-[3px_3px_0_#04050A]"
      />

      <label className="mt-5 flex items-start gap-3 font-semibold text-[#04050A]">
        <input
          type="checkbox"
          checked={isConfirmedAge}
          onChange={(event) => setIsConfirmedAge(event.target.checked)}
          className="mt-1 h-5 w-5 accent-[#04050A]"
        />
        <span>I confirm that I am at least 13 years old and have read the <Link href="/privacy" className="font-black underline">privacy policy</Link>.</span>
      </label>

      {status && <p role="alert" className="mt-4 font-bold text-[#FF5E78]">{status}</p>}

      <button
        type="submit"
        disabled={isSending}
        className="mt-6 w-full rounded-xl border-2 border-[#04050A] bg-[#04050A] px-6 py-4 text-lg font-black text-[#F3F6FF] transition hover:bg-[#FF5E78] disabled:cursor-wait disabled:opacity-60"
      >
        {isSending ? "Sending…" : "Send to support"}
      </button>
    </form>
  );
}

