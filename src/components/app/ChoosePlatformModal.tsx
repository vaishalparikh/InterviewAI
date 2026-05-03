"use client";

import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  sessionId?: string;
  onClose: () => void;
};

export default function ChoosePlatformModal({ open, sessionId, onClose }: Props) {
  const router = useRouter();
  if (!open) return null;

  function openInBrowser() {
    onClose();
    if (sessionId) router.push(`/app/sessions/${sessionId}`);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[460px] rounded-2xl bg-white p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-neutral-950">Choose Platform</h2>
            <p className="mt-1 text-[13px] text-neutral-500">
              How would you like to connect to your call session?
            </p>
          </div>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="m4 5.4 1.4-1.4L10 8.6 14.6 4l1.4 1.4L11.4 10 16 14.6 14.6 16 10 11.4 5.4 16 4 14.6 8.6 10z" />
            </svg>
          </button>
        </div>

        <div className="relative mt-6">
          <button
            onClick={openInBrowser}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 py-3.5 text-[14px] font-semibold text-white transition hover:bg-neutral-800"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 18v3" />
            </svg>
            Desktop App
          </button>
          <span
            className="absolute -right-2 -top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-950"
            style={{
              background: "linear-gradient(90deg, #5fcceb 0%, #87e8c5 100%)",
            }}
          >
            Recommended
          </span>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-[13px] text-neutral-500">
          or
          <button
            onClick={openInBrowser}
            className="inline-flex items-center gap-1.5 text-neutral-900 underline-offset-2 hover:underline"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
            </svg>
            Open in Browser
          </button>
        </div>

        <div className="mt-6 border-t border-neutral-200 pt-4 text-center">
          <a href="#" className="inline-flex items-center gap-1.5 text-[13px] text-neutral-700 hover:text-neutral-950">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
            Browser vs Desktop App
          </a>
        </div>
      </div>
    </div>
  );
}
