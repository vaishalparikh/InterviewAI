"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppTopBar from "@/components/app/AppTopBar";
import CreateSessionModal from "@/components/app/CreateSessionModal";
import { useStore } from "@/lib/store";

const sources = [
  { name: "Google", icon: "🔍" },
  { name: "Facebook", icon: "📘" },
  { name: "ChatGPT", icon: "💬" },
  { name: "Reddit", icon: "📰" },
  { name: "TikTok", icon: "🎵" },
  { name: "YouTube", icon: "📺" },
  { name: "Friend", icon: "👥" },
  { name: "Instagram", icon: "📷" },
  { name: "X / Twitter", icon: "𝕏" },
  { name: "Other", icon: "✨" },
];

const steps: {
  eyebrow: string;
  emoji: string;
  body: string;
  cta: string;
  highlighted?: boolean;
}[] = [
  {
    eyebrow: "Optional:",
    emoji: "📝",
    body: "Upload your resume so InterviewAI can generate customs answers to the interview questions.",
    cta: "Upload Resume",
  },
  {
    eyebrow: "Step 1:",
    emoji: "⏰",
    body: "See how easy InterviewAI is to use. Free Sessions are free and limited to 10 minutes.",
    cta: "Try for Free",
    highlighted: true,
  },
  {
    eyebrow: "Step 2:",
    emoji: "💳",
    body: "Buy credits to use for the real interview or get unlimited access to all features by subscribing.",
    cta: "Purchase",
  },
  {
    eyebrow: "Step 3:",
    emoji: "💼",
    body: "Use InterviewAI for a real interview to get the job you have always dreamed of.",
    cta: "Start",
  },
];

const titleFor = (eyebrow: string) =>
  eyebrow === "Optional:" ? "Resume" :
  eyebrow === "Step 1:" ? "Free Session" :
  eyebrow === "Step 2:" ? "Buy Credits" : "Real Interview";

export default function HomePage() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const [createOpen, setCreateOpen] = useState(false);
  const [free, setFree] = useState(true);

  return (
    <>
      <AppTopBar
        title="Home"
        icon={
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 11 9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
          </svg>
        }
        onStartFree={() => { setFree(true); setCreateOpen(true); }}
        onStart={() => { setFree(false); setCreateOpen(true); }}
      />

      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-[28px] font-bold tracking-tight text-neutral-950">
            Hi, {user?.name?.split(" ")[0] ?? "there"} <span className="inline-block">👋🏻</span>
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:gap-3">
            {steps.map((s, i) => (
              <Fragment key={s.cta}>
                <div className="flex flex-col">
                  <div className="text-[15px] text-neutral-700">
                    {s.eyebrow} <span className="font-bold text-neutral-950">{titleFor(s.eyebrow)}</span> <span aria-hidden>{s.emoji}</span>
                  </div>
                  <div className="mt-3 flex flex-1 flex-col rounded-2xl border border-neutral-200 bg-white p-5">
                    <p className="text-[13.5px] leading-relaxed text-neutral-700">{s.body}</p>
                  </div>
                  <div className="relative mt-4">
                    {s.highlighted && (
                      <div aria-hidden className="cta-glow-ring absolute inset-0 rounded-xl" />
                    )}
                    {s.cta === "Upload Resume" ? (
                      <Link
                        href="/app/resumes"
                        className="relative block w-full rounded-xl border border-neutral-200 bg-white py-3 text-center text-[13.5px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
                      >
                        {s.cta}
                      </Link>
                    ) : s.cta === "Purchase" ? (
                      <Link
                        href="/#pricing"
                        className="relative block w-full rounded-xl border border-neutral-200 bg-white py-3 text-center text-[13.5px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
                      >
                        {s.cta}
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          if (s.cta === "Try for Free") {
                            setFree(true);
                            setCreateOpen(true);
                          } else {
                            setFree(false);
                            setCreateOpen(true);
                          }
                        }}
                        className={`relative w-full rounded-xl py-3 text-[13.5px] font-semibold transition ${
                          s.highlighted
                            ? "bg-neutral-950 text-white hover:bg-neutral-800"
                            : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
                        }`}
                      >
                        {s.cta}
                      </button>
                    )}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden items-center justify-center text-neutral-400 lg:flex">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          <section className="mt-16">
            <h3 className="text-center text-[22px] font-bold tracking-tight text-neutral-950">
              Where did you hear about us?
            </h3>
            <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-neutral-200 bg-neutral-50/40 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {sources.map((s) => (
                  <button
                    key={s.name}
                    className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 text-[13.5px] font-semibold text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
                  >
                    <span className="text-base">{s.icon}</span>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <CreateSessionModal
        open={createOpen}
        free={free}
        onClose={() => setCreateOpen(false)}
        onCreated={() => router.push("/app/sessions")}
      />
    </>
  );
}
