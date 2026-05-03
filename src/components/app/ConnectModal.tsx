"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { store, useStore } from "@/lib/store";

type Props = {
  open: boolean;
  sessionId?: string;
  onBack?: () => void;
  onClose: () => void;
};

const platformIcons: { name: string; bg: string; svg: React.ReactNode }[] = [
  {
    name: "Zoom",
    bg: "bg-blue-500",
    svg: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <rect x="3" y="6" width="13" height="12" rx="2.5" />
        <path d="M16 10l5-2.5v9L16 14z" />
      </svg>
    ),
  },
  {
    name: "Google Meet",
    bg: "bg-emerald-500",
    svg: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <rect x="3" y="6" width="13" height="12" rx="2.5" />
        <path d="M16 10l5-2.5v9L16 14z" />
      </svg>
    ),
  },
  {
    name: "Teams",
    bg: "bg-indigo-500",
    svg: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M5 4h12v3h-4v10h-4V7H5z" />
        <circle cx="18.5" cy="8" r="2.5" />
        <path d="M16 12h5v5a3 3 0 01-3 3 3 3 0 01-3-3v-3a2 2 0 011-2z" />
      </svg>
    ),
  },
  {
    name: "Webex",
    bg: "bg-cyan-500",
    svg: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M4 5h16a2 2 0 012 2v8a2 2 0 01-2 2h-7l-5 4v-4H4a2 2 0 01-2-2V7a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    name: "Phone",
    bg: "bg-rose-500",
    svg: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M6.6 2.7a2 2 0 012.8 0l2 2a2 2 0 010 2.8L10 9a13 13 0 005 5l1.5-1.4a2 2 0 012.8 0l2 2a2 2 0 010 2.8l-1.5 1.5a3 3 0 01-3 .8A19 19 0 014 7.5a3 3 0 01.8-3z" />
      </svg>
    ),
  },
];

export default function ConnectModal({ open, sessionId, onBack, onClose }: Props) {
  const router = useRouter();
  const session = useStore((s) =>
    sessionId ? s.sessions.find((x) => x.id === sessionId) : undefined,
  );

  const [language, setLanguage] = useState("English");
  const [simple, setSimple] = useState(true);
  const [aiModel, setAiModel] = useState("GPT-4.1 Mini");

  // Hydrate from saved session whenever modal opens
  useEffect(() => {
    if (open && session) {
      setLanguage(session.language);
      setSimple(session.simpleLanguage);
      setAiModel(session.aiModel);
    }
  }, [open, session]);

  if (!open || !session) return null;

  const isInterview = session.mode === "interview";

  function handleActivate() {
    if (!session) return;
    // Persist any tweaks the user made on this screen — drop the old session,
    // recreate with the same id-equivalent fields. (We have no in-place edit
    // helper, so just remove + re-add to apply changes.)
    if (
      session.language !== language ||
      session.simpleLanguage !== simple ||
      session.aiModel !== aiModel
    ) {
      store.removeSession(session.id);
      store.createSession({
        title: session.title,
        description: session.description,
        mode: session.mode,
        jobUrl: session.jobUrl,
        resumeName: session.resumeName,
        documentIds: session.documentIds,
        language,
        simpleLanguage: simple,
        extraContext: session.extraContext,
        aiModel,
        autoGenerate: session.autoGenerate,
        free: session.free,
      });
    }
    store.activateSession(session.id);
    onClose();
    router.push(`/dashboard/sessions/${session.id}`);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        {/* Header */}
        <div className="flex items-start justify-between px-7 pb-2 pt-7">
          <h2 className="text-[20px] font-bold text-neutral-950">Connect</h2>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="m4 5.4 1.4-1.4L10 8.6 14.6 4l1.4 1.4L11.4 10 16 14.6 14.6 16 10 11.4 5.4 16 4 14.6 8.6 10z" />
            </svg>
          </button>
        </div>

        {/* Description summary */}
        <div className="px-7 pb-4">
          <p className="text-[13.5px] leading-relaxed text-neutral-700">
            This is {isInterview ? "an Interview" : "a Regular Call"} Session for{" "}
            {isInterview ? (
              <>
                a position{" "}
                <span className="font-semibold text-neutral-950">
                  &quot;{session.description.slice(0, 80) || "—"}&quot;
                </span>{" "}
                at <span className="font-semibold text-neutral-950">&quot;{session.title}&quot;</span>
              </>
            ) : (
              <span className="font-semibold text-neutral-950">&quot;{session.title}&quot;</span>
            )}
            {session.extraContext && (
              <>
                {" "}and{" "}
                <span className="cursor-help underline decoration-dotted underline-offset-2" title={session.extraContext}>
                  extra context
                </span>
              </>
            )}
            .
          </p>
        </div>

        {/* Settings */}
        <div className="space-y-4 px-7">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              <label className="mb-1.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-neutral-900">
                🌐 Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] focus:border-neutral-400 focus:outline-none"
              >
                {["English", "Spanish", "French", "German", "Hindi", "Mandarin", "Japanese"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col items-end">
              <label className="mb-1.5 text-[13.5px] font-semibold text-neutral-900">Simple</label>
              <button
                type="button"
                onClick={() => setSimple(!simple)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                  simple ? "bg-neutral-950" : "bg-neutral-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    simple ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-neutral-900">
              🤖 AI Model
            </label>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[13.5px]">
              <div className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-neutral-950 text-white">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  </svg>
                </span>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="bg-transparent font-medium text-neutral-900 focus:outline-none"
                >
                  <option>GPT-4.1 Mini</option>
                  <option>GPT-4.1</option>
                  <option>GPT-5</option>
                  <option>Claude 4 Sonnet</option>
                  <option>Claude 4 Opus</option>
                </select>
                {aiModel === "GPT-4.1 Mini" && (
                  <span className="rounded-md bg-neutral-950 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Recommended
                  </span>
                )}
                <span className="text-neutral-500">{aiModel.includes("Mini") ? "Fast" : "Balanced"}</span>
              </div>
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-neutral-500" fill="currentColor">
                <path d="M10 14l-5-5h10z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-5 px-7">
          <div className="space-y-2.5 rounded-lg border border-neutral-200 bg-neutral-50/60 p-3.5 text-[12.5px] leading-relaxed text-neutral-700">
            <p>🎙 Make sure to select the &quot;Also share tab audio&quot; option when sharing the screen.</p>
            <p>🚨 Make sure that the interview is taking place in a tab inside of Chrome and not another, different app.</p>
          </div>
        </div>

        {/* How to Connect */}
        <div className="mt-5 px-7">
          <div className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-neutral-900">How to Connect:</span>
              <div className="flex items-center gap-1.5">
                {platformIcons.map((p) => (
                  <span
                    key={p.name}
                    title={p.name}
                    className={`grid h-6 w-6 place-items-center rounded-md text-white ${p.bg}`}
                  >
                    {p.svg}
                  </span>
                ))}
              </div>
            </div>
            <a href="#" className="inline-flex items-center gap-1 text-[12.5px] text-neutral-700 underline-offset-2 hover:text-neutral-950 hover:underline">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              Video Tutorial
            </a>
          </div>
        </div>

        {/* Mock interview tip */}
        <div className="mt-3 px-7">
          <div className="flex gap-3 rounded-lg border border-neutral-200 bg-white p-3">
            <a href="#" className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-md bg-gradient-to-br from-neutral-700 to-neutral-900">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-white/90" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </a>
            <p className="text-[12.5px] leading-relaxed text-neutral-700">
              📺 Instead of an interview tab, you can also share a{" "}
              <span className="font-semibold">mock interview</span> on YouTube and test InterviewAI that way.
              <br />
              Example video:{" "}
              <a href="#" className="font-semibold text-neutral-900 underline-offset-2 hover:underline">Mock Interview</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between gap-3 px-7 pb-7 pt-2">
          <button
            onClick={onBack ?? onClose}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white py-2.5 text-[13.5px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
          >
            ← Back
          </button>
          <button
            onClick={handleActivate}
            className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-neutral-950 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-neutral-800"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            Activate and Connect
          </button>
        </div>
      </div>
    </div>
  );
}
