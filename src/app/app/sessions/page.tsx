"use client";

import { useState } from "react";
import Link from "next/link";
import AppTopBar from "@/components/app/AppTopBar";
import CreateSessionModal from "@/components/app/CreateSessionModal";
import ChoosePlatformModal from "@/components/app/ChoosePlatformModal";
import { store, useStore } from "@/lib/store";

export default function SessionsPage() {
  const sessions = useStore((s) => s.sessions);
  const [createOpen, setCreateOpen] = useState(false);
  const [free, setFree] = useState(true);
  const [platformFor, setPlatformFor] = useState<string | null>(null);

  return (
    <>
      <AppTopBar
        title="Call Sessions"
        icon={
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        }
        onStartFree={() => { setFree(true); setCreateOpen(true); }}
        onStart={() => { setFree(false); setCreateOpen(true); }}
      />

      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-[1.2fr_1.6fr_70px_1.2fr_0.6fr_1fr_140px] items-center gap-4 border-b border-neutral-200 pb-3 text-[12.5px] font-semibold text-neutral-700">
            <div>Title</div>
            <div>Description</div>
            <div>Mode</div>
            <div>Ends In</div>
            <div>AI Usage</div>
            <div>Created At</div>
            <div />
          </div>

          {sessions.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-neutral-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-[14px] text-neutral-500">No Interview Sessions yet.</p>
              <button
                onClick={() => { setFree(true); setCreateOpen(true); }}
                className="mt-4 rounded-lg bg-neutral-950 px-5 py-2 text-[13px] font-semibold text-white hover:bg-neutral-800"
              >
                Start Free Session
              </button>
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[1.2fr_1.6fr_70px_1.2fr_0.6fr_1fr_140px] items-center gap-4 border-b border-neutral-100 py-4 text-[14px]"
              >
                <Link href={`/app/sessions/${s.id}`} className="font-semibold text-neutral-950 hover:underline">
                  {s.title}
                </Link>
                <div className="truncate text-neutral-700">{s.description}</div>
                <div className="text-neutral-700">
                  {s.mode === "interview" ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  {s.endsIn}
                  {s.free && s.status === "not_activated" && (
                    <span className="rounded-md bg-neutral-950 px-2 py-0.5 text-[11px] font-bold text-white">Free</span>
                  )}
                  {s.status === "active" && (
                    <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">Live</span>
                  )}
                  {s.status === "ended" && (
                    <span className="rounded-md bg-neutral-200 px-2 py-0.5 text-[11px] font-bold text-neutral-700">Ended</span>
                  )}
                </div>
                <div className="text-neutral-700">{s.aiUsage}</div>
                <div className="text-neutral-700">{s.createdAt}</div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/app/sessions/${s.id}`}
                    className="grid h-8 w-8 place-items-center rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    title="View details"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="14" y2="18"/></svg>
                  </Link>
                  <button
                    onClick={() => {
                      const next = prompt("Edit description:", s.description);
                      if (next != null && next.trim() !== "") {
                        store.removeSession(s.id);
                        store.createSession({ ...s, description: next.trim(), documentIds: s.documentIds });
                      }
                    }}
                    className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    title="Edit"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setPlatformFor(s.id)}
                    className="grid h-8 w-8 place-items-center rounded-md bg-rose-500 text-white hover:bg-rose-600"
                    title="Connect"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <circle cx="12" cy="12" r="6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}

          {sessions.length > 0 && (
            <div className="mt-6 flex items-center justify-between text-[13px] text-neutral-500">
              <div>Page 1 · Showing 1-{sessions.length} of {sessions.length}</div>
              <div className="flex gap-2">
                <button className="rounded-md border border-neutral-200 bg-white px-4 py-1.5 text-neutral-400" disabled>Previous</button>
                <button className="rounded-md border border-neutral-200 bg-white px-4 py-1.5 text-neutral-400" disabled>Next</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <CreateSessionModal
        open={createOpen}
        free={free}
        onClose={() => setCreateOpen(false)}
      />
      <ChoosePlatformModal
        open={!!platformFor}
        sessionId={platformFor ?? undefined}
        onClose={() => setPlatformFor(null)}
      />
    </>
  );
}
