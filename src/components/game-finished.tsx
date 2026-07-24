"use client";

type GameFinishedProps = {
  winnerCount: number;
  winnerScore?: number;
  isHost: boolean;
  isRestarting: boolean;
  isGameboardView?: boolean;
  onPlayAgain: () => void;
  onBackToHome: () => void;
};

export function GameFinished({
  winnerCount,
  winnerScore,
  isHost,
  isRestarting,
  isGameboardView = false,
  onPlayAgain,
  onBackToHome,
}: GameFinishedProps) {
  const isTie = winnerCount > 1;

  return (
    <section className={`${isGameboardView ? "mt-3 p-3" : "mt-6 p-6 shadow-[8px_8px_0_#04050A]"} rounded-3xl border-4 border-[#04050A] bg-[#ffca3a] text-center`}>
      <p className="text-sm font-black uppercase tracking-[0.16em]">
        Game over
      </p>

      <h2 className={`${isGameboardView ? "mt-1 text-3xl" : "mt-2 text-4xl sm:text-5xl"} font-black uppercase tracking-tight`}>
        {isTie ? "It’s a tie!" : "We have a winner!"}
      </h2>

      <p className={`${isGameboardView ? "mt-1" : "mt-3 text-lg"} font-bold`}>
        {winnerScore
          ? `Winning score: ${winnerScore}`
          : "The final scores are above."}
      </p>

      <p className={`${isGameboardView ? "mt-1 text-sm" : "mt-2"} font-semibold text-[#04050A]`}>
        {isTie
          ? "The leaders finished level and share the win."
          : "That game is officially in the books."}
      </p>

      <div className={`${isGameboardView ? "mt-2" : "mt-6"} flex flex-col justify-center gap-3 sm:flex-row`}>
        {isHost ? (
          <button
            type="button"
            onClick={onPlayAgain}
            disabled={isRestarting}
            className="rounded-xl border-2 border-[#04050A] bg-[#04050A] px-6 py-3 font-black text-[#F3F6FF] transition hover:bg-[#FF5E78] disabled:cursor-wait disabled:opacity-60"
          >
            {isRestarting ? "Resetting room…" : "Play again with this group"}
          </button>
        ) : (
          <p className="rounded-xl border-2 border-dashed border-[#04050A] px-6 py-3 font-bold">
            Waiting for the captain to choose a rematch…
          </p>
        )}

        <button
          type="button"
          onClick={onBackToHome}
          className="rounded-xl border-2 border-[#04050A] bg-[#F3F6FF] px-6 py-3 font-black transition hover:bg-[#F3F6FF]"
        >
          Leave game
        </button>
      </div>
    </section>
  );
}

