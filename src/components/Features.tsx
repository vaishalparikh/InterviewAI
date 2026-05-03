type Card = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

const baseSvg = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const cards: Card[] = [
  {
    title: "Full Coding Support",
    body:
      "Captures your screen during LeetCode and HackerRank rounds. Returns working solutions with line-by-line explanations in under a second.",
    icon: (
      <svg {...baseSvg} className="h-5 w-5">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: "Blazing Fast Transcription",
    body:
      "State-of-the-art speech recognition with sub-second latency. Captures system audio directly — works even with headphones on.",
    icon: (
      <svg {...baseSvg} className="h-5 w-5">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    ),
  },
  {
    title: "100% Accurate Answers",
    body:
      "Pick GPT-5, GPT-4.1 or Claude 4 Sonnet. Grounded in your resume + uploaded docs so answers sound like you.",
    icon: (
      <svg {...baseSvg} className="h-5 w-5">
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
];

const detailed = [
  {
    eyebrow: "Personalize",
    title: "Upload your resume once.",
    body: "Every answer pulls from your actual experience — projects, metrics, tech stack. No more generic ChatGPT mush about \"leveraging synergies\".",
  },
  {
    eyebrow: "Automate",
    title: "Auto-detect questions.",
    body: "Question detection runs in the background. You don't click anything — just look at the screen when you need a hint.",
  },
  {
    eyebrow: "Ground",
    title: "Bring your own knowledge base.",
    body: "Upload product docs, Notion pages, PDFs. The copilot cites them where relevant so behavioral and case answers stay specific.",
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-700">
          Features
        </span>
        <h2 className="mt-4 text-balance text-[36px] font-bold leading-[1.1] tracking-tightest text-neutral-950 sm:text-[44px]">
          Everything you need to ace the loop
        </h2>
        <p className="mt-4 text-pretty text-[16px] leading-relaxed text-neutral-600">
          Built for technical, behavioral, system design and case interviews — on every platform you'll encounter.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <article
            key={c.title}
            className="rounded-2xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-neutral-950 text-white">
              {c.icon}
            </div>
            <h3 className="mt-5 text-[16px] font-bold tracking-tight text-neutral-950">{c.title}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-600">{c.body}</p>
          </article>
        ))}
      </div>

      {/* Detailed rows */}
      <div className="mt-20 grid gap-3 md:grid-cols-3">
        {detailed.map((d) => (
          <div key={d.title} className="rounded-2xl border border-neutral-200 bg-neutral-50/40 p-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
              {d.eyebrow}
            </span>
            <h4 className="mt-3 text-[18px] font-bold tracking-tight text-neutral-950">{d.title}</h4>
            <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-600">{d.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
