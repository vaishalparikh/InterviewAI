"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { store, useStore } from "@/lib/store";

function PlanCard() {
  const plan = useStore((s) => s.plan);
  const isPaid = plan.type !== "free";
  const renews = plan.renewsAt ? new Date(plan.renewsAt) : null;

  if (!isPaid) {
    return (
      <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          Free Plan
        </div>
        <p className="mt-2 text-[12.5px] leading-[1.45] text-neutral-600">
          Start a 10 min free session or buy credits for full-length call sessions.
        </p>
        <Link
          href="/app/upgrade"
          className="mt-3 block w-full rounded-lg bg-neutral-950 py-2 text-center text-[13px] font-semibold text-white transition hover:bg-neutral-800"
        >
          Upgrade
        </Link>
      </div>
    );
  }

  // Paid plan
  return (
    <div className="mt-3 rounded-2xl border border-neutral-900 bg-gradient-to-b from-neutral-950 to-neutral-900 p-4 text-white">
      <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-emerald-300">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        Pro · Active
      </div>
      <div className="mt-2 truncate text-[13.5px] font-bold">{plan.name}</div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-neutral-400">
        {plan.credits != null && (
          <span><span className="font-semibold text-white">{plan.credits}</span> credits</span>
        )}
        {renews && <span>Renews {renews.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}
        {plan.type === "lifetime" && <span>Forever</span>}
      </div>
      <Link
        href="/app/upgrade"
        className="mt-3 block w-full rounded-lg bg-white py-1.5 text-center text-[12.5px] font-semibold text-neutral-950 transition hover:bg-neutral-100"
      >
        Manage Plan
      </Link>
    </div>
  );
}

const navTop = [
  {
    href: "/app",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 11 9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    href: "/app/sessions",
    label: "Call Sessions",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const navBottom = [
  {
    href: "/app/resumes",
    label: "CVs / Resumes",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M9 13h6M9 17h4" />
      </svg>
    ),
  },
  {
    href: "/app/documents",
    label: "Documents",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useStore((s) => s.user);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  function handleSignOut() {
    store.signOut();
    setMenuOpen(false);
    router.replace("/signin");
  }

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="flex h-16 items-center px-6">
        <Link href="/app" className="flex items-center gap-2">
          <span className="text-xl">🦜</span>
          <span className="text-[16px] font-bold tracking-tight text-neutral-950">
            InterviewAI
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pt-2">
        <div className="space-y-0.5">
          {navTop.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition ${
                isActive(item.href)
                  ? "bg-neutral-100 text-neutral-950"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="my-3 h-px bg-neutral-200" />

        <div className="space-y-0.5">
          {navBottom.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition ${
                isActive(item.href)
                  ? "bg-neutral-100 text-neutral-950"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-neutral-200 p-3">
        <div className="space-y-0.5">
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
            Get Help
          </a>
          <button
            onClick={() => setDownloadOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13.5px] font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
          >
            <span className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download Desktop App
            </span>
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 transition ${downloadOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {downloadOpen && (
            <div className="mt-1 space-y-1 px-3 pb-2">
              <a href="#" className="block rounded-md px-2 py-1 text-[12.5px] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">
                macOS (Apple Silicon)
              </a>
              <a href="#" className="block rounded-md px-2 py-1 text-[12.5px] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">
                macOS (Intel)
              </a>
              <a href="#" className="block rounded-md px-2 py-1 text-[12.5px] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">
                Windows
              </a>
            </div>
          )}
        </div>

        <PlanCard />



        {/* User menu */}
        <div className="relative mt-3">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-950 text-[10px] font-bold text-white">
              {user?.name?.[0] ?? "U"}
            </span>
            <span className="flex-1 truncate text-left">{user?.email ?? "—"}</span>
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M5 8l5 5 5-5z" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-rose-600 hover:bg-rose-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
