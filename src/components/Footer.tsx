import Link from "next/link";

const cols = [
  { title: "Product", links: ["Features", "Pricing", "Reviews", "Desktop App"] },
  { title: "Company", links: ["About", "Blog", "Affiliates", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Refund Policy", "Status"] },
];

export default function Footer() {
  return (
    <>
      {/* Closing CTA panel */}
      <section className="px-5 pb-16 pt-12 sm:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-neutral-950 px-8 py-16 text-center sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(20,184,166,0.18),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-[34px] font-bold leading-[1.1] tracking-tightest text-white sm:text-[48px]">
              Walk in calm. Walk out hired.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] text-neutral-400">
              10 free minutes of live coaching. No card. No fine print. Open it before your next call.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[14px] font-semibold text-neutral-950 transition hover:bg-neutral-100"
              >
                Try Free for 10 minutes →
              </Link>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-[14px] font-medium text-white transition hover:bg-white/10"
              >
                Download for Mac ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl">🦜</span>
                <span className="text-[16px] font-bold tracking-tight text-neutral-950">
                  InterviewAI
                </span>
              </Link>
              <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-neutral-600">
                The real-time AI interview copilot trusted by 1.5M+ candidates landing offers at top tech companies.
              </p>
            </div>
            {cols.map((col) => (
              <div key={col.title}>
                <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                  {col.title}
                </div>
                <ul className="space-y-2.5 text-[13px]">
                  {col.links.map((x) => (
                    <li key={x}>
                      <a href="#" className="text-neutral-700 transition hover:text-neutral-950">
                        {x}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center">
            <p className="text-[12px] text-neutral-500">
              © 2026 InterviewAI Inc. All rights reserved.
            </p>
            <div className="flex gap-3">
              {["YouTube", "X", "LinkedIn", "Instagram", "TikTok"].map((s) => (
                <a key={s} href="#" className="text-[12px] text-neutral-600 hover:text-neutral-950">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
