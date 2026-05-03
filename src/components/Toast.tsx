"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ToastKind = "success" | "error" | "info";

type Toast = {
  id: string;
  kind: ToastKind;
  title?: string;
  message: string;
};

type ToastInput = string | { title?: string; message: string };

type ToastContextValue = {
  show: (kind: ToastKind, t: ToastInput) => void;
  success: (t: ToastInput) => void;
  error: (t: ToastInput) => void;
  info: (t: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION_MS = 4000;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (kind: ToastKind, input: ToastInput) => {
      const id = uid();
      const toast: Toast =
        typeof input === "string"
          ? { id, kind, message: input }
          : { id, kind, ...input };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    show,
    success: (t) => show("success", t),
    error: (t) => show("error", t),
    info: (t) => show("info", t),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // safe no-op fallback if mounted outside provider (shouldn't happen)
    const noop = () => {};
    return {
      show: noop,
      success: noop,
      error: noop,
      info: noop,
      dismiss: noop,
    } as unknown as ToastContextValue;
  }
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-[200] flex flex-col gap-2.5"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const [leaving, setLeaving] = useState(false);

  // pre-fade just before auto-dismiss for a nicer exit
  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), DURATION_MS - 220);
    return () => clearTimeout(t);
  }, []);

  const cfg = {
    success: {
      ring: "ring-emerald-200",
      bar: "bg-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-700",
      icon: (
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" />
        </svg>
      ),
    },
    error: {
      ring: "ring-rose-200",
      bar: "bg-rose-500",
      iconBg: "bg-rose-50 text-rose-700",
      icon: (
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M10 1a9 9 0 100 18 9 9 0 000-18zm0 4a1 1 0 011 1v4a1 1 0 11-2 0V6a1 1 0 011-1zm0 9.5a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
        </svg>
      ),
    },
    info: {
      ring: "ring-sky-200",
      bar: "bg-sky-500",
      iconBg: "bg-sky-50 text-sky-700",
      icon: (
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M10 1a9 9 0 100 18 9 9 0 000-18zm0 5.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM9 10h2v5H9v-5z" />
        </svg>
      ),
    },
  }[toast.kind];

  return (
    <div
      className={`pointer-events-auto flex w-[340px] max-w-[calc(100vw-2rem)] items-start gap-3 overflow-hidden rounded-xl bg-white p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.18),0_4px_8px_-4px_rgba(0,0,0,0.08)] ring-1 ${cfg.ring} ${
        leaving ? "animate-toast-leave" : "animate-toast-in"
      }`}
    >
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${cfg.iconBg}`}>
        {cfg.icon}
      </span>
      <div className="min-w-0 flex-1">
        {toast.title && (
          <div className="text-[13.5px] font-semibold text-neutral-950">
            {toast.title}
          </div>
        )}
        <p
          className={`text-[13px] leading-snug ${toast.title ? "mt-0.5 text-neutral-600" : "text-neutral-900"}`}
        >
          {toast.message}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="grid h-6 w-6 shrink-0 place-items-center rounded text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
          <path d="m4 5.4 1.4-1.4L10 8.6 14.6 4l1.4 1.4L11.4 10 16 14.6 14.6 16 10 11.4 5.4 16 4 14.6 8.6 10z" />
        </svg>
      </button>
      <span aria-hidden className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar} animate-toast-bar`} />
    </div>
  );
}
