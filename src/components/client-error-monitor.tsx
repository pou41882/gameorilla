"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/error-reporting";

export function ClientErrorMonitor() {
  useEffect(() => {
    function reportUnhandledError() {
      void reportClientError({
        errorCode: "client.unhandled_error",
        phase: "window",
      });
    }

    function reportUnhandledRejection() {
      void reportClientError({
        errorCode: "client.unhandled_rejection",
        phase: "window",
      });
    }

    window.addEventListener("error", reportUnhandledError);
    window.addEventListener("unhandledrejection", reportUnhandledRejection);

    return () => {
      window.removeEventListener("error", reportUnhandledError);
      window.removeEventListener("unhandledrejection", reportUnhandledRejection);
    };
  }, []);

  return null;
}

