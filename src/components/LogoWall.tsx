const companies = [
  "Microsoft",
  "Amazon",
  "Google",
  "Meta",
  "Tesla",
  "Apple",
  "Netflix",
  "Stripe",
  "Uber",
];

export default function LogoWall() {
  return (
    <section className="border-y border-neutral-200/70 bg-neutral-50/70 py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="mb-7 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
          Used in 100,000+ interviews at top companies
        </p>
        <div className="mask-fade-x relative overflow-hidden">
          <div className="flex w-max animate-marquee gap-14">
            {[...companies, ...companies].map((c, i) => (
              <div
                key={i}
                className="flex h-8 shrink-0 items-center text-[20px] font-bold tracking-tight text-neutral-400"
              >
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
