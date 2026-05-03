import Link from "next/link";

const links = [
  { label: "Features", href: "#features" },
  { label: "Reviews", href: "#reviews" },
  { label: "Privacy", href: "#privacy" },
  { label: "Pricing", href: "#pricing" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🦜</span>
          <span className="text-[16px] font-bold tracking-tight text-neutral-950">
            InterviewAI
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13.5px] font-medium text-neutral-600 transition hover:text-neutral-950"
            >
              {l.label}
            </a>
          ))}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[12px] font-medium text-neutral-700">
            Desktop App
            <span className="rounded bg-neutral-950 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
              NEW
            </span>
          </span>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/signin"
            className="hidden text-[13.5px] font-medium text-neutral-600 transition hover:text-neutral-950 sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/signin"
            className="rounded-lg bg-neutral-950 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-neutral-800"
          >
            Try Free
          </Link>
        </div>
      </div>
    </header>
  );
}
