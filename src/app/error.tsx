"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/error-reporting";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Gameorilla page error", error);
    void reportClientError({
      errorCode: "page.error_boundary",
      phase: "render",
    });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F6FF] px-6 text-[#04050A]">
      <section className="max-w-xl rounded-[2rem] border-2 border-[#04050A] bg-[#F3F6FF] p-8 text-center shadow-[8px_8px_0_#04050A]">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-[#FF5E78]">Unexpected detour</p>
        <h1 className="mt-3 text-5xl font-black tracking-[-0.06em]">That did not go as planned.</h1>
        <p className="mt-5 text-lg font-semibold text-[#04050A]">Try the page again. If it keeps happening, send the visible details to support.</p>
        <button type="button" onClick={() => unstable_retry()} className="mt-7 rounded-xl border-2 border-[#04050A] bg-[#04050A] px-6 py-3 font-black text-[#F3F6FF]">Try again</button>
      </section>
    </main>
  );
}

