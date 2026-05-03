"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { store, useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";

const interviewerLines = [
  "Do you use Java?",
  "Walk me through how you'd design a rate limiter for an API at scale.",
  "Tell me about a time you had to push back on an executive's decision.",
  "What's a technical challenge you're particularly proud of solving?",
  "How do you handle disagreements with teammates on technical direction?",
  "Where do you see yourself in 5 years?",
];

const aiAnswers = [
  "Yes, I have experience with Java as part of my programming skills. While my main experience is with JavaScript frameworks like React.js, Angular.js, and Node.js, I have also worked with Java during my studies and projects. I understand Java's core concepts and object-oriented principles, and I am comfortable using it when needed.",
  "**1. Token bucket per user.** Issue N tokens, refill at fixed rate. O(1) check on each request.\n\n**2. Distributed counters in Redis** with INCR + EXPIRE. Sharded by user_id hash to avoid hotspots.\n\n**3. Sliding window log** if we need precise fairness — trade memory for accuracy.",
  "At Notion, our VP wanted to ship a v2 SDK before our largest customer renewed — 6 weeks, no migration plan. I ran a 3-day usage audit, showed 40% of API calls would break silently, and proposed a phased plan with a no-op fallback. We held the launch 4 weeks. Customer renewed.",
  "I led the migration of our payment service from sync DB calls inside request handlers to a properly pooled async setup. Brought p99 latency from 2.4s down to 180ms during peak load. The hard part wasn't the refactor — it was building observability so we could trust the new system.",
  "I default to writing things down. When two engineers disagree, the disagreement is usually about an unstated assumption or a missing constraint. A short doc with the tradeoffs surfaces those, and most of the time we converge without a meeting.",
  "Honestly, I want to keep working on systems that have to actually scale under load — that's where I feel I learn fastest. Whether that's a tech-lead role or eventually founding something is less important than the problem.",
];

type Turn = { who: "you"; text: string; at: string };

function fmtTimer(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function fmtClock(d = new Date()) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function minsLeft(seconds: number) {
  return Math.ceil(seconds / 60);
}

export default function LiveSessionPage() {
  const router = useRouter();
  const toast = useToast();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const session = useStore((s) => s.sessions.find((x) => x.id === id));

  const [secondsLeft, setSecondsLeft] = useState(600);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [micConnected, setMicConnected] = useState(false);
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string>("");
  const [aiTyping, setAiTyping] = useState(false);
  const [aiAnsweredAt, setAiAnsweredAt] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const micRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ranOnce = useRef(false);

  useEffect(() => {
    if (session) setSecondsLeft(session.free ? 600 : 3600);
  }, [session?.id, session?.free, session]);

  // timer ticks down once mic is connected (= "session live")
  useEffect(() => {
    if (!micConnected) return;
    tickRef.current = setInterval(() => {
      setSecondsLeft((v) => {
        if (v <= 1) {
          setMicConnected(false);
          if (id) store.endSession(id);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [micConnected, id]);

  // mock mic-driven transcript: when connected, occasionally drop a "you spoke" line
  useEffect(() => {
    if (!micConnected) return;
    const phrases = [
      "Okay. So why I want to use the Java.",
      "Java is the basic language.",
      "Okay.",
      "You use.",
      "Hmm, let me think about that.",
    ];
    let idx = 0;
    micRef.current = setInterval(() => {
      const text = phrases[idx % phrases.length];
      idx++;
      setTranscript((t) => [...t, { who: "you", text, at: fmtClock() }]);
    }, 9000);
    return () => {
      if (micRef.current) clearInterval(micRef.current);
    };
  }, [micConnected]);

  // auto-answer mode: every 12s while mic connected, generate a question + answer
  useEffect(() => {
    if (!micConnected || !session?.autoGenerate) return;
    const t = setInterval(() => generateAnswer(), 12000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micConnected, session?.autoGenerate]);

  // keep transcript scrolled
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  function generateAnswer() {
    const idx = Math.floor(Math.random() * interviewerLines.length);
    const q = interviewerLines[idx];
    const a = aiAnswers[idx];
    setAiQuestion(q);
    setAiAnswer("");
    setAiTyping(true);
    setAiAnsweredAt(null);
    let i = 0;
    const tick = setInterval(() => {
      i += 6;
      setAiAnswer(a.slice(0, i));
      if (i >= a.length) {
        clearInterval(tick);
        setAiTyping(false);
        setAiAnsweredAt(fmtClock());
        if (id) {
          // bump usage cheaply by re-using endSession's counter? Skip for now.
        }
      }
    }, 18);
  }

  function handleSendManual() {
    const text = manualInput.trim();
    if (!text) return;
    setTranscript((t) => [...t, { who: "you", text, at: fmtClock() }]);
    setManualInput("");
  }

  function handleClearTranscript() {
    setTranscript([]);
  }

  function handleClearAi() {
    setAiQuestion(null);
    setAiAnswer("");
    setAiAnsweredAt(null);
  }

  function handleConnect() {
    if (!session || !id) return;
    setMicConnected(true);
    if (session.status !== "active" && !ranOnce.current) {
      store.activateSession(id);
      ranOnce.current = true;
    }
    toast.success({ title: "Microphone connected", message: "We'll listen and transcribe what you say." });
  }

  function handleExit() {
    if (id) store.endSession(id, transcript.length);
    router.push("/dashboard/sessions");
  }

  function handleScreenshot() {
    toast.info({
      title: "Screenshot captured",
      message: "We'll detect any coding question on the screen and send it to the AI.",
    });
    generateAnswer();
  }

  if (!session) {
    return (
      <div className="grid h-full place-items-center text-[14px] text-neutral-500">
        <div className="text-center">
          <p>Session not found.</p>
          <Link
            href="/dashboard/sessions"
            className="mt-3 inline-block rounded-lg bg-neutral-950 px-4 py-2 text-[13px] font-semibold text-white hover:bg-neutral-800"
          >
            Back to sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-neutral-50">
      {/* Top bar */}
      <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-neutral-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-neutral-700 transition hover:bg-neutral-50">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9V5a2 2 0 0 1 2-2h4M21 9V5a2 2 0 0 0-2-2h-4M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" />
            </svg>
            Fullscreen
          </button>
          <button className="rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-neutral-700 transition hover:bg-neutral-50">
            Change Tab
          </button>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg">🦜</span>
          <span className="text-[14px] font-bold tracking-tight text-neutral-950">InterviewAI</span>
        </Link>
        <div className="flex items-center justify-end gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-[12.5px]">
            <span className="text-rose-500">⏰</span>
            <span className="font-semibold text-neutral-900">{minsLeft(secondsLeft)} mins</span>
            {session.free && <span className="text-neutral-500">(Free)</span>}
          </div>
          <button
            onClick={() => setSecondsLeft(session.free ? 600 : 3600)}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
            title="Reset timer"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor"><path d="M5 8l5 5 5-5z" /></svg>
          </button>
          <button
            onClick={handleExit}
            className="rounded-md bg-rose-500 px-3 py-1.5 text-[13px] font-semibold text-white transition hover:bg-rose-600"
          >
            Exit
          </button>
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-2">
        {/* LEFT: Transcript + Mic + Manual + Bottom CTAs */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white">
          {/* Top control row */}
          <div className="relative flex items-center gap-2 border-b border-neutral-100 px-4 py-3">
            {!micConnected ? (
              <button
                onClick={handleConnect}
                className="group inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
                title="Connect your microphone to include what you are saying in the AI response to provide more context."
              >
                Connect
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setMicConnected(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-3 py-1.5 text-[13px] font-semibold text-white transition hover:bg-rose-600"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Stop
              </button>
            )}
            <button
              onClick={handleClearTranscript}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                <path d="m4 5.4 1.4-1.4L10 8.6 14.6 4l1.4 1.4L11.4 10 16 14.6 14.6 16 10 11.4 5.4 16 4 14.6 8.6 10z" />
              </svg>
              Clear
            </button>
            <div className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] text-neutral-700">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
              </svg>
              {session.language}
            </div>
          </div>

          {/* Transcript chat */}
          <div ref={transcriptRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {transcript.length === 0 && (
              <p className="py-12 text-center text-[13px] text-neutral-400">
                {micConnected
                  ? "Listening… speak or type a manual message below."
                  : 'Click "Connect" to enable the microphone, or type below.'}
              </p>
            )}
            {transcript.map((t, i) => (
              <div key={i} className="flex flex-col items-end gap-1">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-neutral-100 px-4 py-2.5 text-[14px] text-neutral-900">
                  {t.text}
                </div>
                <div className="text-[11px] text-neutral-500">You · {t.at}</div>
              </div>
            ))}
          </div>

          {/* Manual input */}
          <div className="flex items-center gap-2 border-t border-neutral-100 px-4 py-3">
            <input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendManual();
              }}
              placeholder="Type a manual message..."
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
            />
            <button
              onClick={handleSendManual}
              disabled={!manualInput.trim()}
              className="rounded-lg bg-neutral-100 px-4 py-2 text-[13px] font-semibold text-neutral-700 transition hover:bg-neutral-200 disabled:text-neutral-400"
            >
              Send
            </button>
          </div>

          {/* Bottom CTAs */}
          <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 px-3 py-3">
            <div className="relative">
              <div aria-hidden className="cta-glow-ring absolute inset-0 rounded-xl" />
              <button
                onClick={generateAnswer}
                disabled={aiTyping}
                className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 py-3 text-[14px] font-semibold text-white transition hover:bg-neutral-800 disabled:bg-neutral-700"
              >
                <span aria-hidden>✨</span>
                {aiTyping ? "Thinking..." : "Answer"}
              </button>
            </div>
            <button
              onClick={handleScreenshot}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 text-[14px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 18v3" />
              </svg>
              Screenshot
            </button>
          </div>
        </section>

        {/* RIGHT: AI Question + Answer */}
        <section className="relative flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white">
          {/* Floating Clear Messages */}
          {(aiQuestion || aiAnswer) && (
            <button
              onClick={handleClearAi}
              className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-neutral-600 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                <path d="m4 5.4 1.4-1.4L10 8.6 14.6 4l1.4 1.4L11.4 10 16 14.6 14.6 16 10 11.4 5.4 16 4 14.6 8.6 10z" />
              </svg>
              Clear Messages
            </button>
          )}

          <div className="flex-1 overflow-y-auto px-7 py-6">
            {!aiQuestion && !aiAnswer && (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-2xl">
                    💬
                  </div>
                  <p className="text-[14px] font-semibold text-neutral-900">No messages yet.</p>
                  <p className="mt-1 text-[13px] text-neutral-500">
                    Click <span className="font-semibold">&quot;Answer&quot;</span> or{" "}
                    <span className="font-semibold">&quot;AI Answer&quot;</span> to start!
                  </p>
                </div>
              </div>
            )}

            {aiQuestion && (
              <div className="mb-5">
                <div className="flex items-center gap-2 text-[14px] text-neutral-900">
                  <span aria-hidden>💬</span>
                  <span className="font-bold">Question:</span>
                  <span className="text-neutral-700">{aiQuestion}</span>
                </div>
              </div>
            )}

            {(aiAnswer || aiTyping) && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-[14px] text-neutral-900">
                  <span aria-hidden className="text-amber-500">⭐</span>
                  <span className="font-bold">Answer:</span>
                </div>
                <div className="whitespace-pre-wrap text-[14px] leading-[1.65] text-neutral-800">
                  {aiAnswer}
                  {aiTyping && <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-neutral-700 align-middle" />}
                </div>
                {aiAnsweredAt && (
                  <div className="mt-3 text-[12px] text-neutral-500">Answer · {aiAnsweredAt}</div>
                )}
              </div>
            )}
          </div>

          {/* Manual input on right (mirror) */}
          <div className="flex items-center gap-2 border-t border-neutral-100 px-4 py-3">
            <input
              placeholder="Type a manual message..."
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v) {
                    setAiQuestion(v);
                    generateAnswer();
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
            <button className="rounded-lg bg-neutral-100 px-4 py-2 text-[13px] font-semibold text-neutral-400">
              Send
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
