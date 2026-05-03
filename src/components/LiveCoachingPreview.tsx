import { Bookmark, Minimize, Pin, Refresh, Sparkle, Waveform } from "./icons";

const star = [
  {
    l: "S",
    w: "Situation",
    t: "VP wanted to ship a v2 SDK before our largest customer renewed. 6-week deadline, no migration plan.",
  },
  {
    l: "T",
    w: "Task",
    t: "Decide whether to build her version or push back with data.",
  },
  {
    l: "A",
    w: "Action",
    t: "Ran a 3-day usage audit. Showed 40% of API calls would break silently. Proposed a phased plan + a no-op fallback.",
  },
  {
    l: "R",
    w: "Result",
    t: "Held the launch 4 weeks. Customer renewed. VP later cited it as a 'judgment call she trusted.'",
  },
];

export default function LiveCoachingPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#06070a]">
      {/* mock 2-tile video call backdrop */}
      <div className="absolute inset-0 grid grid-cols-2 gap-3 p-3">
        {/* interviewer tile */}
        <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-neutral-800 to-neutral-950">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 40%, rgba(255,255,255,0.06), transparent 60%)",
            }}
          />
          <div className="absolute left-1/2 top-[42%] grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-neutral-300 to-neutral-500 text-[28px] font-bold text-neutral-900 shadow-lg">
            SC
          </div>
          <div className="absolute bottom-3 left-3.5 flex items-center gap-2 text-[13px] font-medium text-white">
            <Waveform bars={6} className="text-emerald-400" />
            <span>Sarah Chen</span>
            <span className="text-white/50">· Tessera Labs</span>
          </div>
        </div>

        {/* self tile */}
        <div className="relative overflow-hidden rounded-[14px] border-2 border-emerald-400/40 bg-gradient-to-b from-neutral-800 to-neutral-950">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 60% at 60% 50%, rgba(16,185,129,0.10), transparent 70%)",
            }}
          />
          <div className="absolute left-1/2 top-[42%] grid h-[88px] w-[88px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-neutral-500 to-neutral-700 text-[24px] font-bold text-neutral-100 shadow-lg">
            MK
          </div>
          <div className="absolute bottom-3 left-3.5 text-[13px] font-medium text-white">
            You
          </div>
          <div className="absolute right-3 top-3 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-white">
            HD
          </div>
        </div>
      </div>

      {/* call controls */}
      <div className="absolute bottom-[18px] left-1/2 z-[5] flex -translate-x-1/2 gap-2 rounded-full border border-white/10 bg-[rgba(15,17,21,0.85)] p-2 backdrop-blur-xl">
        {[
          "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM5 12a7 7 0 0 0 14 0M12 21v-2",
          "M3 7h12v10H3zM21 8l-6 4 6 4z",
          "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM4 21a8 8 0 0 1 16 0",
          "M5 12h.01M12 12h.01M19 12h.01",
        ].map((d, i) => (
          <button
            key={i}
            className="grid h-[38px] w-[38px] place-items-center rounded-full bg-white/[0.08] text-white"
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d={d} />
            </svg>
          </button>
        ))}
        <button className="grid h-[38px] w-16 place-items-center rounded-full bg-rose-600 text-[12px] font-medium text-white hover:bg-rose-700">
          End
        </button>
      </div>

      {/* glass coach overlay panel */}
      <div className="absolute bottom-[18px] right-[18px] top-[18px] z-10 flex w-[340px] flex-col overflow-hidden rounded-[18px] border border-white/10 bg-[rgba(20,23,29,0.92)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6),0_8px_20px_-8px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
        {/* subtle emerald glow at top */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-10 z-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(16,185,129,0.18), transparent 60%)",
          }}
        />

        {/* header */}
        <div className="relative z-[1] flex items-center gap-2 border-b border-white/[0.06] px-3.5 py-3">
          <div className="grid h-[22px] w-[22px] place-items-center rounded-md bg-emerald-500 text-white">
            <Sparkle size={12} stroke={2.4} />
          </div>
          <span className="text-[13px] font-semibold text-neutral-200">Coach</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-[11px] text-rose-400">
            <span
              className="h-1.5 w-1.5 rounded-full bg-current"
              style={{ animation: "iv-pulse 1.6s ease-in-out infinite" }}
            />
            live
          </span>
          <div className="flex-1" />
          <button className="grid h-6 w-6 place-items-center rounded text-neutral-400 hover:bg-white/5 hover:text-neutral-200">
            <Refresh size={13} />
          </button>
          <button className="grid h-6 w-6 place-items-center rounded text-neutral-400 hover:bg-white/5 hover:text-neutral-200">
            <Minimize size={13} />
          </button>
        </div>

        {/* body */}
        <div className="no-scrollbar relative z-[1] flex-1 overflow-auto p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
            Detected question
          </div>
          <div className="mb-[18px] text-[14px] leading-[1.4] text-neutral-100">
            "Tell me about a time you pushed back on an executive."
          </div>

          {/* story header */}
          <div className="mb-3.5 flex items-center gap-2.5 rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-3 py-2.5">
            <Pin size={13} className="text-emerald-400" />
            <div className="flex-1 text-[12.5px] text-neutral-200">
              <span className="font-medium">The Notion SDK redesign</span>
              <span className="text-neutral-500"> · from your resume</span>
            </div>
          </div>

          <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
            STAR · talking points
          </div>
          <div className="flex flex-col gap-2.5">
            {star.map((s) => (
              <div key={s.l} className="flex gap-2.5">
                <div className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md bg-emerald-500/15 font-mono text-[11px] font-bold text-emerald-400">
                  {s.l}
                </div>
                <div className="flex-1 text-[12.5px] leading-[1.5] text-neutral-200">
                  <span className="text-neutral-500">{s.w}. </span>
                  <span>{s.t}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[18px]">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
              If she pushes back
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                "She'll likely ask: 'How did the VP react in the moment?'",
                "Lead with: 'I came with a counter-plan, not just a no.'",
              ].map((t, i) => (
                <div
                  key={i}
                  className="border-l-2 border-white/[0.14] pl-3 text-[12px] leading-[1.5] text-neutral-400"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* footer actions */}
        <div className="relative z-[1] flex gap-1.5 border-t border-white/[0.06] px-3 py-2.5">
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border border-white/[0.08] bg-transparent px-2.5 py-2 text-[12px] text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200">
            <Refresh size={11} /> Different angle
          </button>
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-2 text-[12px] text-emerald-300 hover:bg-emerald-500/15">
            <Bookmark size={11} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
