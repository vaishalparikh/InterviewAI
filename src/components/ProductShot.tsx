import LiveCoachingPreview from "./LiveCoachingPreview";

const stats = [
  { l: "<400ms", s: "transcript latency" },
  { l: "100%", s: "hidden from screen share" },
  { l: "7 langs", s: "supported" },
];

export default function ProductShot() {
  return (
    <section
      id="product"
      className="mx-auto max-w-6xl px-5 py-24 text-center sm:px-8"
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-700">
        See it in action
      </span>
      <h2 className="mx-auto mt-4 max-w-2xl text-balance text-[36px] font-bold leading-[1.1] tracking-tightest text-neutral-950 sm:text-[44px]">
        One panel. One unfair advantage.
      </h2>

      <div className="relative mx-auto mt-12 max-w-4xl rounded-[20px] border border-neutral-200 bg-white p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.18)]">
        <div className="relative h-[420px] overflow-hidden rounded-[14px] sm:h-[520px]">
          <LiveCoachingPreview />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-neutral-600">
        {stats.map((s) => (
          <div key={s.l} className="flex items-center gap-2">
            <span className="text-[20px] font-bold tracking-tight text-neutral-950">{s.l}</span>
            <span>{s.s}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
