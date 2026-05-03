import Link from "next/link";

const avatars = [
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-violet-400 to-fuchsia-500",
];

function Star() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-amber-400">
      <path d="M10 1l2.6 5.9 6.4.6-4.8 4.4 1.4 6.3L10 15l-5.6 3.2 1.4-6.3L1 7.5l6.4-.6L10 1z" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[500px] max-w-6xl bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.10),transparent_60%)]"
      />
      <div className="mx-auto max-w-5xl px-5 pb-16 pt-20 text-center sm:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[12.5px] font-medium text-neutral-700 shadow-sm">
          <span className="rounded bg-neutral-950 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            New
          </span>
          Powered by GPT-5 &amp; Claude 4 Sonnet
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-[44px] font-bold leading-[1.05] tracking-tightest text-neutral-950 sm:text-[64px] md:text-[76px]">
          Your Real-Time AI <br className="hidden sm:block" />
          Interview Copilot
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-[16px] leading-relaxed text-neutral-600 sm:text-[17px]">
          Listens to your interview, transcribes in real time, and feeds you contextual
          answers — invisible to screen share.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <Link
            href="/signin"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-7 py-3.5 text-[14.5px] font-semibold text-white transition hover:bg-neutral-800 sm:w-auto"
          >
            Try Free for 10 minutes →
          </Link>
          <a
            href="#product"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3.5 text-[14.5px] font-semibold text-neutral-900 transition hover:bg-neutral-50 sm:w-auto"
          >
            ▶ Watch the demo
          </a>
        </div>

        <p className="mt-4 text-[12.5px] text-neutral-500">
          No credit card · Cancel anytime · 30-day refund
        </p>

        {/* social proof */}
        <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {avatars.map((c, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br ${c} shadow-sm`}
                />
              ))}
            </div>
            <div className="text-left text-[13px]">
              <div className="font-bold text-neutral-950">1,534,135+ users</div>
              <div className="text-neutral-500">choose InterviewAI</div>
            </div>
          </div>
          <div className="hidden h-8 w-px bg-neutral-200 sm:block" />
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} />)}
            </div>
            <div className="text-left text-[13px]">
              <div className="font-bold text-neutral-950">4.86 / 5</div>
              <div className="text-neutral-500">340,066+ reviews</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
