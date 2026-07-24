import { getOrCreateAnonymousUser, supabase } from "@/lib/supabase";

type ClientErrorReport = {
  errorCode: string;
  phase?: string;
  route?: string;
};

const REPORT_COOLDOWN_MS = 5 * 60_000;
const recentReports = new Map<string, number>();

function cleanErrorCode(value: string) {
  const cleaned = value.trim().toLowerCase();

  return /^[a-z0-9][a-z0-9_.:-]{2,79}$/.test(cleaned)
    ? cleaned
    : "client.unknown_error";
}

function cleanPhase(value?: string) {
  const cleaned = value?.trim().toLowerCase().slice(0, 40);
  return cleaned || undefined;
}

function cleanRoute(value?: string) {
  const fallback =
    typeof window === "undefined" ? "/" : window.location.pathname;
  const path = (value || fallback).split("?", 1)[0].slice(0, 160);

  return path.startsWith("/") ? path : "/";
}

export async function reportClientError({
  errorCode,
  phase,
  route,
}: ClientErrorReport) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedCode = cleanErrorCode(errorCode);
  const normalizedPhase = cleanPhase(phase);
  const normalizedRoute = cleanRoute(route);
  const reportKey = `${normalizedCode}:${normalizedRoute}:${normalizedPhase ?? ""}`;
  const now = Date.now();

  if (now - (recentReports.get(reportKey) ?? 0) < REPORT_COOLDOWN_MS) {
    return;
  }

  recentReports.set(reportKey, now);

  try {
    await getOrCreateAnonymousUser();
    await supabase.rpc("record_client_error", {
      p_error_code: normalizedCode,
      p_route: normalizedRoute,
      p_phase: normalizedPhase ?? null,
    });
  } catch {
    // Error reporting must never interrupt the game or create a reporting loop.
  }
}

