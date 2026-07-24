"use client";

import { useEffect, useState } from "react";
import { getOrCreateAnonymousUser, supabase } from "@/lib/supabase";

type RoundResult = {
  result_answer_id: string;
  result_answer_text: string;
  author_name: string;
  votes_received: number;
  points_awarded: number;
  got_sweep_bonus: boolean;
};

type ScoreboardEntry = {
  score_player_id: string;
  score_player_name: string;
  score_total: number;
};

type RoundResultsProps = {
  roomCode: string;
  roundId: string;
  isGameboardView?: boolean;
  canReport?: boolean;
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

  return "Could not complete that request.";
}

export function RoundResults({
  roomCode,
  roundId,
  isGameboardView = false,
  canReport = false,
}: RoundResultsProps) {
  const [results, setResults] = useState<RoundResult[]>([]);
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reportingAnswerId, setReportingAnswerId] = useState("");
  const [reportReason, setReportReason] = useState("harassment");
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportedAnswerIds, setReportedAnswerIds] = useState<string[]>([]);
  const [reportMessage, setReportMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      setIsLoading(true);
      setMessage("");

      try {
        await getOrCreateAnonymousUser();

        const [resultsResponse, scoreboardResponse] = await Promise.all([
          supabase.rpc("get_round_results", { p_room_code: roomCode }),
          supabase.rpc("get_room_scoreboard", { p_room_code: roomCode }),
        ]);

        if (resultsResponse.error) throw resultsResponse.error;
        if (scoreboardResponse.error) throw scoreboardResponse.error;

        if (!cancelled) {
          setResults((resultsResponse.data as RoundResult[] | null) ?? []);
          setScoreboard((scoreboardResponse.data as ScoreboardEntry[] | null) ?? []);
        }
      } catch (error) {
        if (!cancelled) setMessage(getErrorMessage(error));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadResults();
    return () => { cancelled = true; };
  }, [roomCode, roundId]);

  async function submitReport(answerId: string) {
    setIsReporting(true);
    setReportMessage("");

    try {
      await getOrCreateAnonymousUser();
      const { data, error } = await supabase.rpc("report_round_answer", {
        p_room_code: roomCode,
        p_answer_id: answerId,
        p_reason: reportReason,
        p_details: reportDetails,
      });

      if (error) throw error;
      const result = (data as { report_id: string }[] | null)?.[0];
      if (!result?.report_id) throw new Error("The report was not saved.");

      setReportedAnswerIds((previous) => [...previous, answerId]);
      setReportingAnswerId("");
      setReportReason("harassment");
      setReportDetails("");
      setReportMessage("Report received. Thank you for helping keep the room safe.");
    } catch (error) {
      setReportMessage(getErrorMessage(error));
    } finally {
      setIsReporting(false);
    }
  }

  if (isLoading) {
    return <div className="rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] p-6 font-bold">Counting the votes…</div>;
  }

  if (message) {
    return <div className="rounded-2xl border-2 border-[#04050A] bg-[#FF3EA8] p-6 font-bold">{message}</div>;
  }

  return (
    <div className={`grid min-h-0 ${isGameboardView ? "gap-3 overflow-hidden lg:grid-cols-[1.4fr_0.6fr]" : "gap-6 lg:grid-cols-[1.4fr_0.6fr]"}`}>
      <section className={`min-h-0 rounded-2xl border-2 border-[#04050A] bg-[#F3F6FF] ${isGameboardView ? "overflow-hidden p-3" : "p-5"}`}>
        <p className="text-sm font-black uppercase tracking-[0.12em]">Round results</p>

        <div className={`grid min-h-0 ${isGameboardView ? "mt-3 gap-2 overflow-hidden" : "mt-5 gap-3"}`}>
          {results.map((result, index) => {
            const isReportingThis = reportingAnswerId === result.result_answer_id;
            const wasReported = reportedAnswerIds.includes(result.result_answer_id);

            return (
              <article key={result.result_answer_id} className={`rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] ${isGameboardView ? "p-3" : "p-5"}`}>
                <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between ${isGameboardView ? "gap-2" : "gap-3"}`}>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-[#FF5E78]">#{index + 1} · {result.author_name}</p>
                    <p className={`${isGameboardView ? "mt-1 text-lg leading-tight" : "mt-2 text-xl"} font-black`}>{result.result_answer_text}</p>
                  </div>
                  <div className="shrink-0 rounded-xl border-2 border-[#04050A] bg-[#FF3EA8] px-4 py-3 text-center">
                    <p className="text-xl font-black">+{result.points_awarded}</p>
                    <p className="text-xs font-black uppercase tracking-[0.1em]">points</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-[#04050A]">
                  <span>{result.votes_received} {result.votes_received === 1 ? "vote" : "votes"}</span>
                  {result.got_sweep_bonus && <span className="rounded-full border-2 border-[#04050A] bg-[#FF5E78] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#F3F6FF]">Clean sweep ×3</span>}
                  {canReport && !isGameboardView && (
                    <button
                      type="button"
                      disabled={wasReported}
                      onClick={() => {
                        setReportingAnswerId(isReportingThis ? "" : result.result_answer_id);
                        setReportMessage("");
                      }}
                      className="ml-auto text-xs font-black uppercase tracking-[0.1em] underline underline-offset-4 disabled:no-underline"
                    >
                      {wasReported ? "Reported" : isReportingThis ? "Cancel report" : "Report answer"}
                    </button>
                  )}
                </div>

                {isReportingThis && (
                  <div className="mt-4 rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] p-4">
                    <label className="text-xs font-black uppercase tracking-[0.1em]" htmlFor={`reason-${result.result_answer_id}`}>Why are you reporting this?</label>
                    <select id={`reason-${result.result_answer_id}`} value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="mt-2 w-full rounded-lg border-2 border-[#04050A] bg-[#F3F6FF] px-3 py-2 font-bold">
                      <option value="harassment">Harassment or bullying</option>
                      <option value="hate">Hate or discrimination</option>
                      <option value="sexual">Sexual or exploitative content</option>
                      <option value="personal_info">Private personal information</option>
                      <option value="other">Other safety concern</option>
                    </select>
                    <label className="mt-3 block text-xs font-black uppercase tracking-[0.1em]" htmlFor={`details-${result.result_answer_id}`}>Optional details</label>
                    <textarea id={`details-${result.result_answer_id}`} value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} maxLength={500} rows={2} className="mt-2 w-full resize-y rounded-lg border-2 border-[#04050A] bg-[#F3F6FF] px-3 py-2 font-semibold" />
                    <button type="button" onClick={() => void submitReport(result.result_answer_id)} disabled={isReporting} className="mt-3 rounded-lg border-2 border-[#04050A] bg-[#04050A] px-4 py-2 font-black text-[#F3F6FF] disabled:opacity-60">
                      {isReporting ? "Sending…" : "Submit report"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {reportMessage && <p role="status" className="mt-4 font-bold text-[#04050A]">{reportMessage}</p>}
      </section>

      <aside className={`min-h-0 rounded-2xl border-2 border-[#04050A] bg-[#04050A] text-[#F3F6FF] ${isGameboardView ? "overflow-hidden p-3" : "p-5"}`}>
        <p className="text-sm font-black uppercase tracking-[0.12em] text-[#FF3EA8]">Scoreboard</p>
        <ol className="mt-5 grid gap-3">
          {scoreboard.map((player, index) => (
            <li key={player.score_player_id} className={`flex items-center justify-between border-b border-[#F3F6FF] font-black last:border-b-0 ${isGameboardView ? "pb-2 text-base" : "pb-3 text-lg"}`}>
              <span>{index + 1}. {player.score_player_name}</span>
              <span>{player.score_total}</span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

