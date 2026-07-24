"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { supabase } from "@/lib/supabase";
import { displayRoomCode } from "@/lib/room-codes.mjs";

type AccessState = "checking" | "signed_out" | "unauthorized" | "admin";
type ReviewStatus = "new" | "reviewing" | "resolved";

type Overview = {
  window_days: number;
  rooms_created: number;
  player_joins: number;
  games_started: number;
  rounds_completed: number;
  games_finished: number;
  rematches_started: number;
  client_errors: number;
  open_support_requests: number;
  open_answer_reports: number;
};

type DailyMetric = {
  metric_date: string;
  metric_type: string;
  metric_count: number;
};

type SupportRequest = {
  request_id: string;
  reply_email: string;
  category: string;
  message: string;
  request_status: ReviewStatus;
  created_at: string;
};

type AnswerReport = {
  report_id: string;
  room_code: string;
  answer_text: string;
  author_name: string;
  reason: string;
  details: string | null;
  report_status: ReviewStatus;
  created_at: string;
};

type ClientErrorEvent = {
  error_event_id: number;
  error_code: string;
  route: string;
  phase: string | null;
  created_at: string;
};

type Health = {
  activePromptCount?: number;
  checkedAt?: string;
  database?: string;
  status: string;
};

const statusOptions: ReviewStatus[] = ["new", "reviewing", "resolved"];

function firstRow<T>(value: T[] | null) {
  return value?.[0] ?? null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function percent(numerator: number, denominator: number) {
  if (!denominator) {
    return "—";
  }

  return `${Math.round((numerator / denominator) * 100)}%`;
}

function StatusSelect({
  disabled,
  onChange,
  value,
}: {
  disabled: boolean;
  onChange: (status: ReviewStatus) => void;
  value: ReviewStatus;
}) {
  return (
    <select
      aria-label="Review status"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as ReviewStatus)}
      className="rounded-lg border-2 border-[#04050A] bg-[#F3F6FF] px-3 py-2 text-sm font-black disabled:opacity-50"
    >
      {statusOptions.map((status) => (
        <option key={status} value={status}>
          {status[0].toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] p-5 shadow-[4px_4px_0_#04050A]">
      <p className="text-sm font-black uppercase tracking-[0.1em] text-[#04050A]">
        {label}
      </p>
      <p className="mt-2 text-4xl font-black tracking-[-0.05em]">{value}</p>
    </div>
  );
}

export function AdminDashboard() {
  const [access, setAccess] = useState<AccessState>("checking");
  const [email, setEmail] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [days, setDays] = useState(14);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [answerReports, setAnswerReports] = useState<AnswerReport[]>([]);
  const [clientErrors, setClientErrors] = useState<ClientErrorEvent[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [dashboardError, setDashboardError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const verifyAccess = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || session.user.is_anonymous) {
      setAccess("signed_out");
      return;
    }

    const { data, error } = await supabase.rpc("is_app_admin");
    setAccess(!error && data === true ? "admin" : "unauthorized");
  }, []);

  useEffect(() => {
    const initialCheck = window.setTimeout(() => void verifyAccess(), 0);

    const { data } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void verifyAccess(), 0);
    });

    return () => {
      window.clearTimeout(initialCheck);
      data.subscription.unsubscribe();
    };
  }, [verifyAccess]);

  const loadDashboard = useCallback(async () => {
    setIsRefreshing(true);
    setDashboardError("");

    try {
      const [
        overviewResponse,
        dailyResponse,
        supportResponse,
        reportsResponse,
        errorsResponse,
        healthResponse,
      ] = await Promise.all([
        supabase.rpc("get_beta_admin_overview", { p_days: days }),
        supabase.rpc("get_beta_admin_daily_metrics", { p_days: days }),
        supabase.rpc("get_beta_admin_support_requests", {
          p_limit: 100,
          p_status: null,
        }),
        supabase.rpc("get_beta_admin_answer_reports", {
          p_limit: 100,
          p_status: null,
        }),
        supabase.rpc("get_beta_admin_client_errors", { p_limit: 100 }),
        fetch("/api/health", { cache: "no-store" }),
      ]);

      const firstError = [
        overviewResponse.error,
        dailyResponse.error,
        supportResponse.error,
        reportsResponse.error,
        errorsResponse.error,
      ].find(Boolean);

      if (firstError) {
        throw firstError;
      }

      setOverview(firstRow(overviewResponse.data as Overview[] | null));
      setDailyMetrics((dailyResponse.data as DailyMetric[] | null) ?? []);
      setSupportRequests(
        (supportResponse.data as SupportRequest[] | null) ?? [],
      );
      setAnswerReports(
        (reportsResponse.data as AnswerReport[] | null) ?? [],
      );
      setClientErrors(
        (errorsResponse.data as ClientErrorEvent[] | null) ?? [],
      );
      setHealth((await healthResponse.json()) as Health);
    } catch {
      setDashboardError(
        "The owner dashboard could not load. Check the beta migration and try again.",
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [days]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      if (access === "admin") {
        void loadDashboard();
      }
    }, 0);

    return () => window.clearTimeout(initialLoad);
  }, [access, loadDashboard]);

  async function sendLoginLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSendingLink(true);
    setLoginMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
        shouldCreateUser: false,
      },
    });

    setLoginMessage(
      error
        ? "That link could not be sent. Confirm the owner account was invited, then try again."
        : "Check your email for a secure sign-in link.",
    );
    setIsSendingLink(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setOverview(null);
    setAccess("signed_out");
  }

  async function updateStatus(
    kind: "support" | "report",
    id: string,
    status: ReviewStatus,
  ) {
    setUpdatingId(id);
    setDashboardError("");

    const response =
      kind === "support"
        ? await supabase.rpc("update_beta_support_status", {
            p_request_id: id,
            p_status: status,
          })
        : await supabase.rpc("update_beta_answer_report_status", {
            p_report_id: id,
            p_status: status,
          });

    if (response.error) {
      setDashboardError("That status could not be saved. Please try again.");
    } else {
      await loadDashboard();
    }

    setUpdatingId(null);
  }

  if (access === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3F6FF] p-6 text-[#04050A]">
        <p className="font-black">Checking owner access…</p>
      </main>
    );
  }

  if (access === "signed_out") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3F6FF] p-6 text-[#04050A]">
        <section className="w-full max-w-lg rounded-[2rem] border-2 border-[#04050A] bg-[#F3F6FF] p-8 shadow-[8px_8px_0_#04050A]">
          <Link href="/" className="text-xl font-black tracking-[-0.06em]">
            game<span className="text-[#FF5E78]">a</span>rang
          </Link>
          <p className="mt-10 text-sm font-black uppercase tracking-[0.14em] text-[#FF5E78]">
            Private operations
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-[-0.06em]">
            Owner dashboard
          </h1>
          <p className="mt-4 font-semibold leading-relaxed text-[#04050A]">
            Enter the invited owner email. You will receive a secure sign-in
            link—no password needed.
          </p>
          <form onSubmit={sendLoginLink} className="mt-7 space-y-4">
            <label className="block text-sm font-black uppercase tracking-[0.1em]">
              Owner email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] px-4 py-3 text-base font-bold normal-case tracking-normal outline-none focus:bg-[#F3F6FF]"
              />
            </label>
            <button
              type="submit"
              disabled={isSendingLink}
              className="w-full rounded-xl border-2 border-[#04050A] bg-[#04050A] px-5 py-3 font-black text-[#F3F6FF] disabled:opacity-60"
            >
              {isSendingLink ? "Sending…" : "Email me a sign-in link"}
            </button>
          </form>
          {loginMessage && (
            <p className="mt-4 rounded-xl bg-[#FF3EA8] px-4 py-3 font-bold">
              {loginMessage}
            </p>
          )}
        </section>
      </main>
    );
  }

  if (access === "unauthorized") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3F6FF] p-6 text-[#04050A]">
        <section className="max-w-lg rounded-[2rem] border-2 border-[#04050A] bg-[#F3F6FF] p-8 text-center shadow-[8px_8px_0_#04050A]">
          <h1 className="text-4xl font-black tracking-[-0.05em]">
            This account is not an owner.
          </h1>
          <p className="mt-4 font-semibold text-[#04050A]">
            The account is signed in, but it has not been added to the Gameorilla
            owner list.
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-6 rounded-xl border-2 border-[#04050A] bg-[#04050A] px-5 py-3 font-black text-[#F3F6FF]"
          >
            Sign out
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3F6FF] px-5 py-8 text-[#04050A] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b-2 border-[#04050A] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="text-xl font-black tracking-[-0.06em]">
              game<span className="text-[#FF5E78]">a</span>rang
            </Link>
            <p className="mt-5 text-sm font-black uppercase tracking-[0.14em] text-[#FF5E78]">
              Private operations
            </p>
            <h1 className="mt-1 text-5xl font-black tracking-[-0.06em]">
              Beta pulse
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] px-3 font-black">
              Window
              <select
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
                className="bg-transparent py-3 outline-none"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              disabled={isRefreshing}
              className="rounded-xl border-2 border-[#04050A] bg-[#FF3EA8] px-4 py-3 font-black disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-xl border-2 border-[#04050A] bg-[#04050A] px-4 py-3 font-black text-[#F3F6FF]"
            >
              Sign out
            </button>
          </div>
        </header>

        {dashboardError && (
          <p className="mt-6 rounded-xl border-2 border-[#04050A] bg-[#FF5E78] px-5 py-4 font-black text-[#F3F6FF]">
            {dashboardError}
          </p>
        )}

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#04050A]">
                System health
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-[-0.04em]">
                Is the game ready?
              </h2>
            </div>
            <p className={`rounded-full border-2 border-[#04050A] px-4 py-2 font-black ${health?.status === "ok" ? "bg-[#27E7E2]" : "bg-[#FF5E78] text-[#F3F6FF]"}`}>
              {health?.status === "ok" ? "All systems ready" : "Health check unavailable"}
            </p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Active prompts" value={health?.activePromptCount ?? "—"} />
            <MetricCard label="Open support" value={overview?.open_support_requests ?? "—"} />
            <MetricCard label="Open reports" value={overview?.open_answer_reports ?? "—"} />
            <MetricCard label="Client errors" value={overview?.client_errors ?? "—"} />
          </div>
        </section>

        <section className="mt-12">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#04050A]">
            Last {overview?.window_days ?? days} days
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-[-0.04em]">
            Player funnel
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Rooms created" value={overview?.rooms_created ?? "—"} />
            <MetricCard label="Player joins" value={overview?.player_joins ?? "—"} />
            <MetricCard label="Games started" value={overview?.games_started ?? "—"} />
            <MetricCard label="Games finished" value={overview?.games_finished ?? "—"} />
            <MetricCard label="Rounds completed" value={overview?.rounds_completed ?? "—"} />
            <MetricCard label="Rematches" value={overview?.rematches_started ?? "—"} />
            <MetricCard label="Room → start" value={overview ? percent(overview.games_started, overview.rooms_created) : "—"} />
            <MetricCard label="Start → finish" value={overview ? percent(overview.games_finished, overview.games_started) : "—"} />
          </div>
        </section>

        <section className="mt-12 rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] p-5 sm:p-7">
          <h2 className="text-3xl font-black tracking-[-0.04em]">Daily activity</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left">
              <thead className="border-b-2 border-[#04050A] text-sm uppercase tracking-[0.08em]">
                <tr><th className="py-3 pr-4">Date</th><th className="py-3 pr-4">Event</th><th className="py-3">Count</th></tr>
              </thead>
              <tbody>
                {dailyMetrics.length ? dailyMetrics.map((metric) => (
                  <tr key={`${metric.metric_date}-${metric.metric_type}`} className="border-b border-[#d3cabb] font-semibold">
                    <td className="py-3 pr-4">{metric.metric_date}</td>
                    <td className="py-3 pr-4">{metric.metric_type.replaceAll("_", " ")}</td>
                    <td className="py-3 font-black">{metric.metric_count}</td>
                  </tr>
                )) : <tr><td colSpan={3} className="py-6 font-semibold text-[#04050A]">No beta activity recorded yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black tracking-[-0.04em]">Support inbox</h2>
          <div className="mt-5 grid gap-4">
            {supportRequests.length ? supportRequests.map((request) => (
              <article key={request.request_id} className="rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div><p className="font-black">{request.category.replaceAll("_", " ")}</p><p className="mt-1 text-sm font-semibold text-[#04050A]">{request.reply_email} · {formatDate(request.created_at)}</p></div>
                  <StatusSelect disabled={updatingId === request.request_id} value={request.request_status} onChange={(status) => void updateStatus("support", request.request_id, status)} />
                </div>
                <p className="mt-4 whitespace-pre-wrap font-semibold leading-relaxed">{request.message}</p>
              </article>
            )) : <p className="rounded-2xl border-2 border-dashed border-[#04050A] p-5 font-semibold">No support requests.</p>}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black tracking-[-0.04em]">Answer safety reports</h2>
          <div className="mt-5 grid gap-4">
            {answerReports.length ? answerReports.map((report) => (
              <article key={report.report_id} className="rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div><p className="font-black">{report.reason.replaceAll("_", " ")} · room {displayRoomCode(report.room_code)}</p><p className="mt-1 text-sm font-semibold text-[#04050A]">{formatDate(report.created_at)}</p></div>
                  <StatusSelect disabled={updatingId === report.report_id} value={report.report_status} onChange={(status) => void updateStatus("report", report.report_id, status)} />
                </div>
                <blockquote className="mt-4 rounded-xl bg-[#F3F6FF] px-4 py-3 text-lg font-black">“{report.answer_text}” <span className="text-sm font-semibold text-[#04050A]">— {report.author_name}</span></blockquote>
                {report.details && <p className="mt-3 whitespace-pre-wrap font-semibold">Reporter note: {report.details}</p>}
              </article>
            )) : <p className="rounded-2xl border-2 border-dashed border-[#04050A] p-5 font-semibold">No answer reports.</p>}
          </div>
        </section>

        <section className="my-12 rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] p-5 sm:p-7">
          <h2 className="text-3xl font-black tracking-[-0.04em]">Recent client errors</h2>
          <p className="mt-2 font-semibold text-[#04050A]">Privacy-safe codes only—no player names, answers, or raw error messages.</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left">
              <thead className="border-b-2 border-[#04050A] text-sm uppercase tracking-[0.08em]"><tr><th className="py-3 pr-4">Time</th><th className="py-3 pr-4">Code</th><th className="py-3 pr-4">Route</th><th className="py-3">Phase</th></tr></thead>
              <tbody>
                {clientErrors.length ? clientErrors.map((item) => (
                  <tr key={item.error_event_id} className="border-b border-[#d3cabb] font-semibold"><td className="py-3 pr-4">{formatDate(item.created_at)}</td><td className="py-3 pr-4 font-mono text-sm">{item.error_code}</td><td className="py-3 pr-4 font-mono text-sm">{item.route}</td><td className="py-3">{item.phase ?? "—"}</td></tr>
                )) : <tr><td colSpan={4} className="py-6 font-semibold text-[#04050A]">No client errors recorded.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
