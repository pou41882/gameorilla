import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F6FF] px-6 text-[#04050A]">
      <section className="max-w-xl rounded-[2rem] border-2 border-[#04050A] bg-[#F3F6FF] p-8 text-center shadow-[8px_8px_0_#04050A]">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-[#FF5E78]">404 · Wrong room</p>
        <h1 className="mt-3 text-5xl font-black tracking-[-0.06em]">Nothing is hiding here.</h1>
        <p className="mt-5 text-lg font-semibold text-[#04050A]">The page may have moved, expired, or never existed.</p>
        <Link href="/" className="mt-7 inline-block rounded-xl border-2 border-[#04050A] bg-[#04050A] px-6 py-3 font-black text-[#F3F6FF]">Return to Gameorilla</Link>
      </section>
    </main>
  );
}

