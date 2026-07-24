"use client";

import { useEffect, useState } from "react";
import { getOrCreateAnonymousUser } from "@/lib/supabase";

export function AnonymousSession() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startSession() {
      try {
        await getOrCreateAnonymousUser();
      } catch (error) {
        console.error("Could not start anonymous session:", error);

        if (!cancelled) {
          setFailed(true);
        }
      }
    }

    void startSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!failed) {
    return null;
  }

  return (
    <p className="mx-auto max-w-6xl rounded-xl border-2 border-[#04050A] bg-[#FF3EA8] px-4 py-3 font-bold">
      Could not start your game session. Refresh and try again.
    </p>
  );
}
