"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { store, useStore } from "@/lib/store";

const interviewerLines = [
  "So tell me a bit about yourself and your background.",
  "Walk me through how you'd design a rate limiter for an API at scale.",
  "Tell me about a time you had to push back on an executive's decision.",
  "What's a technical challenge you're particularly proud of solving?",
  "How do you handle disagreements with teammates on technical direction?",
  "Where do you see yourself in 5 years?",
];

const aiAnswers = [
  "Sure — I've been building distributed systems for the last 6 years, most recently at Stripe where I led the migration of our payments orchestration layer from a monolith to event-driven services. Before that I was at Notion shipping the SDK redesign…",
  "**1. Token bucket per user.** Issue N tokens, refill at fixed rate. O(1) check on each request.\n\n**2. Distributed counters in Redis** with INCR + EXPIRE. Sharded by user_id hash to avoid hotspots.\n\n**3. Sliding window log** if we need precise fairness — trade memory for accuracy.",
  "At Notion, our VP wanted to ship a v2 SDK before our largest customer renewed — 6 weeks, no migration plan. I ran a 3-day usage audit, showed 40% of API calls would break silently, and proposed a phased plan with a no-op fallback. We held the launch 4 weeks. Customer renewed.",
  "I led the migration of our payment service from sync DB calls inside request handlers to a properly pooled async setup. Brought p99 latency from 2.4s down to 180ms during peak load. The hard part wasn't the refactor — it was building observability so we could trust the new system.",
  "I default to writing things down. When two engineers disagree, the disagreement is usually about an unstated assumption or a missing constraint. A short doc with the tradeoffs surfaces those, and most of the time we converge without a meeting.",
  "Honestly, I want to keep working on systems that have to actually scale under load — that's where I feel I learn fastest. Whether that's a tech-lead role or eventually founding something is less important than the problem.",
];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function LiveSessionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const session = useStore((s) => s.sessions.find((x) => x.id === id));

  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 min for free
  const [transcript, setTranscript] = useState<{ who: "interviewer" | "you"; text: string }[]>([]);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiTyping, setAiTyping] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const askRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // initialize timer based on free vs paid once session resolved
  useEffect(() => {
    if (session) {
      setSecondsLeft(session.free ? 600 : 3600);
    }
  }, [session?.id, session?.free, session]);

  // timer
  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setSecondsLeft((v) => {
        if (v <= 1) {
          setRunning(false);
          if (id) store.endSession(id);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [running, id]);

  // simulated interviewer asking questions every ~12s
  useEffect(() => {
    if (!running) return;
    askRef.current = setInterval(() => {
      setQuestionIdx((idx) => {
        const i = idx % interviewerLines.length;
        const q = interviewerLines[i];
        setTranscript((t) => [...t, { who: "interviewer", text: q }]);
        if (session?.autoGenerate) {
          generateAnswer(i);
        }
        return idx + 1;
      });
    }, 12000);
    return () => {
      if (askRef.current) clearInterval(askRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, session?.autoGenerate]);

  // immediately ask the first question on start
  useEffect(() => {
    if (running && transcript.length === 0) {
      const q = interviewerLines[0];
      setTranscript([{ who: "interviewer", text: q }]);
      if (session?.autoGenerate) generateAnswer(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // autoscroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  function generateAnswer(idx: number) {
    const target = aiAnswers[idx % aiAnswers.length];
    setAiResponse("");
    setAiTyping(true);
    let i = 0;
    const tick = setInterval(() => {
      i += 4;
      setAiResponse(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(tick);
        setAiTyping(false);
        if (id) {
          // bump usage
          const cur = store; // satisfy linter
          void cur;
          // we don't track per-call usage in store here; usage is summed on end
        }
      }
    }, 18);
  }

  function handleStart() {
    if (!session || !id) return;
    if (session.status !== "active") store.activateSession(id);
    setRunning(true);
  }

  function handleEnd() {
    if (!id) return;
    setRunning(false);
    store.endSession(id, transcript.filter((t) => t.who === "interviewer").length);
    router.push("/app/sessions");
  }

  function handleAiHelp() {
    const idx = Math.max(0, questionIdx - 1);
    generateAnswer(idx);
  }

  const planText = useMemo(() => {
    if (!session) return "";
    return `${session.aiModel} · ${session.language}${session.simpleLanguage ? " · simple" : ""}`;
  }, [session]);

  if (!session) {
    return (
      <div className="grid h-full place-items-center text-[14px] text-neutral-500">
        <div className="text-center">
          <p>Session not found.</p>
          <Link href="/app/sessions" className="mt-3 inline-block rounded-lg bg-neutral-950 px-4 py-2 text-[13px] font-semibold text-white hover:bg-neutral-800">
            Back to sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-neutral-50">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/app/sessions"
            className="grid h-8 w-8 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-[16px] font-bold tracking-tight text-neutral-950">{session.title}</h1>
            <p className="text-[12px] text-neutral-500">
              {session.description} · <span className="font-mono">{planText}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5">
            {running && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
              </span>
            )}
            <span className="font-mono text-[14px] font-bold text-neutral-950">{fmt(secondsLeft)}</span>
            {session.free && <span className="text-[11px] text-neutral-500">Free</span>}
          </div>
          {!running ? (
            <button
              onClick={handleStart}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
            >
              ▶ {session.status === "ended" ? "Restart" : "Start"} Session
            </button>
          ) : (
            <button
              onClick={handleEnd}
              className="rounded-lg bg-rose-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-rose-700"
            >
              ■ End Session
            </button>
          )}
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-6 lg:grid-cols-5">
        {/* Transcript */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Live Transcript</span>
              {running && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-rose-500" /> REC
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-400">{transcript.length} turn{transcript.length === 1 ? "" : "s"}</span>
          </div>
          <div ref={transcriptRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {transcript.length === 0 && (
              <p className="py-8 text-center text-[13px] text-neutral-400">
                {running ? "Listening…" : "Click Start Session to begin."}
              </p>
            )}
            {transcript.map((t, i) => (
              <div key={i} className="text-[13.5px] leading-relaxed">
                <div className={`mb-0.5 text-[10px] font-bold uppercase tracking-wider ${t.who === "interviewer" ? "text-rose-600" : "text-neutral-500"}`}>
                  {t.who === "interviewer" ? "Interviewer" : "You"}
                </div>
                <div className="text-neutral-800">{t.text}</div>
              </div>
            ))}
            {running && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="h-1 w-1 animate-pulse rounded-full bg-neutral-400" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-neutral-400 [animation-delay:200ms]" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-neutral-400 [animation-delay:400ms]" />
              </div>
            )}
          </div>
        </section>

        {/* AI Response */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-neutral-950 text-white lg:col-span-3">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded bg-emerald-500 text-[10px] font-bold text-white">AI</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                {session.aiModel} {aiTyping && "· generating…"}
              </span>
            </div>
            {!session.autoGenerate && (
              <button
                onClick={handleAiHelp}
                disabled={!running || aiTyping}
                className="rounded-md bg-emerald-500 px-3 py-1 text-[12px] font-semibold text-white hover:bg-emerald-600 disabled:bg-neutral-700 disabled:text-neutral-400"
              >
                ✨ AI Help
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 text-[14px] leading-relaxed text-neutral-100">
            {!aiResponse && !aiTyping && (
              <p className="py-12 text-center text-[13px] text-neutral-500">
                {session.autoGenerate
                  ? "AI will respond automatically once a question is detected."
                  : "Click ✨ AI Help to generate a contextual answer."}
              </p>
            )}
            <div className="whitespace-pre-wrap">
              {aiResponse}
              {aiTyping && <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-emerald-400 align-middle" />}
            </div>
          </div>

          {/* Footer / context bar */}
          <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-[11px] text-neutral-400">
            <span className="rounded-md bg-white/5 px-2 py-0.5 ring-1 ring-white/10">📎 {session.resumeName || "no resume"}</span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 ring-1 ring-white/10">📁 {session.documentIds.length} doc{session.documentIds.length === 1 ? "" : "s"}</span>
            {session.autoGenerate && <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-emerald-300 ring-1 ring-emerald-500/30">Auto AI</span>}
            <span className="ml-auto">interviewai.app · live</span>
          </div>
        </section>
      </main>
    </div>
  );
}
