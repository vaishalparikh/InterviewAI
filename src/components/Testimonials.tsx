const reviews = [
  {
    name: "Maya K.",
    role: "Senior PM · Series-B startup",
    color: "bg-rose-500",
    quote:
      "I bombed three rounds before I tried this. Got the offer on the next interview, $40k above my last band.",
  },
  {
    name: "Devon R.",
    role: "Engineering Manager · FAANG",
    color: "bg-indigo-500",
    quote:
      "The curveball detection genuinely surprised me. Saved me on a 'tell me about a failure' I wasn't ready for.",
  },
  {
    name: "Priya S.",
    role: "Product Designer · YC startup",
    color: "bg-emerald-500",
    quote:
      "It doesn't write the answer for you. It nudges you back to your own best example, in real time. That's the magic.",
  },
  {
    name: "Marcus T.",
    role: "Staff Eng · Meta",
    color: "bg-amber-500",
    quote:
      "Latency is shockingly fast — almost felt like the AI was reading my mind. Nailed the Meta loop after months of rejections.",
  },
  {
    name: "Sarah L.",
    role: "ML Eng · Netflix",
    color: "bg-fuchsia-500",
    quote:
      "Switched from another tool. Transcription quality and answer speed are noticeably better. The mobile version is clutch for phone screens.",
  },
  {
    name: "Tom R.",
    role: "Design · Apple",
    color: "bg-cyan-500",
    quote:
      "Three offers in a month after months of rejections. I'm still in disbelief. The notes feature is great for follow-ups.",
  },
];

function Star() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-amber-400">
      <path d="M10 1l2.6 5.9 6.4.6-4.8 4.4 1.4 6.3L10 15l-5.6 3.2 1.4-6.3L1 7.5l6.4-.6L10 1z" />
    </svg>
  );
}

export default function Testimonials() {
  return (
    <section id="reviews" className="border-t border-neutral-200/70 bg-neutral-50/50 py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-700">
            Loved by candidates
          </span>
          <h2 className="mt-4 text-balance text-[36px] font-bold leading-[1.1] tracking-tightest text-neutral-950 sm:text-[44px]">
            Trusted by 1.5M+ candidates
          </h2>
        </div>

        <div className="mask-fade-x relative overflow-hidden">
          <div className="flex w-max animate-marquee-slow gap-4">
            {[...reviews, ...reviews].map((r, i) => (
              <article
                key={i}
                className="w-[320px] shrink-0 rounded-2xl border border-neutral-200 bg-white p-6"
              >
                <div className="mb-3 flex">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} />)}
                </div>
                <p className="text-[14px] leading-relaxed text-neutral-700">"{r.quote}"</p>
                <div className="mt-5 flex items-center gap-3 border-t border-neutral-100 pt-4">
                  <div className={`grid h-9 w-9 place-items-center rounded-full ${r.color} text-[13px] font-bold text-white`}>
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-neutral-950">{r.name}</div>
                    <div className="text-[11.5px] text-neutral-500">{r.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
