"use client";

import { useSyncExternalStore } from "react";

export type User = { email: string; name: string };

export type Resume = {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
};

export type Doc = {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
};

export type SessionMode = "interview" | "regular";
export type SessionStatus = "not_activated" | "active" | "ended";

export type Session = {
  id: string;
  title: string; // company
  description: string; // job description summary
  mode: SessionMode;
  jobUrl?: string;
  resumeName?: string;
  documentIds: string[];
  language: string;
  simpleLanguage: boolean;
  extraContext?: string;
  aiModel: string;
  autoGenerate: boolean;
  free: boolean;
  status: SessionStatus;
  createdAt: string;
  endsIn: string;
  aiUsage: number;
};

export type PlanType = "free" | "credits" | "subscription" | "lifetime";

export type Plan = {
  type: PlanType;
  name: string; // "Free", "Pro Monthly", "Yearly", "Lifetime", "50 Credits"
  amountPaid: number; // dollars actually charged (after promo)
  period?: "month" | "year" | "one-time" | "credit-pack";
  credits?: number; // remaining credits if type === "credits"
  startedAt?: string; // ISO
  renewsAt?: string; // ISO
  promoCode?: string;
};

export type Invoice = {
  id: string;
  planName: string;
  amount: number;
  paidAt: string;
  status: "paid" | "refunded";
};

export type AppState = {
  user: User | null;
  sessions: Session[];
  resumes: Resume[];
  documents: Doc[];
  plan: Plan;
  invoices: Invoice[];
};

const STORAGE_KEY = "interviewai_state_v1";

export const FREE_PLAN: Plan = {
  type: "free",
  name: "Free Plan",
  amountPaid: 0,
};

const initialState: AppState = {
  user: null,
  sessions: [],
  resumes: [],
  documents: [],
  plan: FREE_PLAN,
  invoices: [],
};

function loadFromStorage(): AppState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return {
      user: parsed.user ?? null,
      sessions: parsed.sessions ?? [],
      resumes: parsed.resumes ?? [],
      documents: parsed.documents ?? [],
      plan: parsed.plan ?? FREE_PLAN,
      invoices: parsed.invoices ?? [],
    };
  } catch {
    return initialState;
  }
}

let state: AppState = typeof window !== "undefined" ? loadFromStorage() : initialState;
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Cross-tab sync
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = loadFromStorage();
      listener();
    }
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => initialState;

export function useStore<T>(selector: (s: AppState) => T): T {
  // useSyncExternalStore guarantees getSnapshot is stable; selector runs each render.
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return selector(snap);
}

/* ------------------------ mutators ------------------------ */

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function fmtDate(d = new Date()) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const store = {
  signIn(email: string) {
    const trimmed = email.trim().toLowerCase();
    const name = trimmed.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "User";
    state = { ...state, user: { email: trimmed, name } };
    emit();
  },
  signOut() {
    state = { ...state, user: null };
    emit();
  },

  /* --- billing --- */
  purchasePlan(input: {
    type: "credits" | "subscription" | "lifetime";
    name: string;
    listPrice: number; // sticker before promo
    discount: number; // 0..1
    period?: Plan["period"];
    credits?: number;
    promoCode?: string;
  }): Plan {
    const amountPaid = +(input.listPrice * (1 - input.discount)).toFixed(2);
    const startedAt = new Date().toISOString();
    let renewsAt: string | undefined;
    if (input.period === "month") {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      renewsAt = d.toISOString();
    } else if (input.period === "year") {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      renewsAt = d.toISOString();
    }
    const plan: Plan = {
      type: input.type,
      name: input.name,
      amountPaid,
      period: input.period,
      credits: input.credits,
      startedAt,
      renewsAt,
      promoCode: input.promoCode,
    };
    const invoice: Invoice = {
      id: uid(),
      planName: input.name,
      amount: amountPaid,
      paidAt: startedAt,
      status: "paid",
    };
    state = { ...state, plan, invoices: [invoice, ...state.invoices] };
    emit();
    return plan;
  },

  cancelPlan() {
    state = { ...state, plan: FREE_PLAN };
    emit();
  },

  consumeCredit(amount = 0.5) {
    if (state.plan.type !== "credits" || state.plan.credits == null) return false;
    if (state.plan.credits < amount) return false;
    state = {
      ...state,
      plan: { ...state.plan, credits: +(state.plan.credits - amount).toFixed(2) },
    };
    emit();
    return true;
  },

  createSession(input: {
    title: string;
    description: string;
    mode: SessionMode;
    jobUrl?: string;
    resumeName?: string;
    documentIds?: string[];
    language: string;
    simpleLanguage: boolean;
    extraContext?: string;
    aiModel: string;
    autoGenerate: boolean;
    free: boolean;
  }): Session {
    const session: Session = {
      id: uid(),
      title: input.title || "Untitled",
      description: input.description || "",
      mode: input.mode,
      jobUrl: input.jobUrl,
      resumeName: input.resumeName,
      documentIds: input.documentIds ?? [],
      language: input.language,
      simpleLanguage: input.simpleLanguage,
      extraContext: input.extraContext,
      aiModel: input.aiModel,
      autoGenerate: input.autoGenerate,
      free: input.free,
      status: "not_activated",
      createdAt: fmtDate(),
      endsIn: "Not Activated",
      aiUsage: 0,
    };
    state = { ...state, sessions: [session, ...state.sessions] };
    emit();
    return session;
  },

  removeSession(id: string) {
    state = { ...state, sessions: state.sessions.filter((s) => s.id !== id) };
    emit();
  },

  activateSession(id: string) {
    state = {
      ...state,
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, status: "active", endsIn: s.free ? "10:00" : "60:00" } : s,
      ),
    };
    emit();
  },

  endSession(id: string, aiUsage = 0) {
    state = {
      ...state,
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, status: "ended", endsIn: "Ended", aiUsage } : s,
      ),
    };
    emit();
  },

  addResume(file: File): Resume {
    const r: Resume = {
      id: uid(),
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
    state = { ...state, resumes: [r, ...state.resumes] };
    emit();
    return r;
  },

  removeResume(id: string) {
    state = { ...state, resumes: state.resumes.filter((r) => r.id !== id) };
    emit();
  },

  addDocument(file: File): Doc {
    const d: Doc = {
      id: uid(),
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
    state = { ...state, documents: [d, ...state.documents] };
    emit();
    return d;
  },

  removeDocument(id: string) {
    state = { ...state, documents: state.documents.filter((d) => d.id !== id) };
    emit();
  },
};

/* ------------------------ helpers ------------------------ */

// Promo codes — keep here so checkout + upgrade page agree
export const PROMO_CODES: Record<string, number> = {
  INTERVIEW50: 0.5,
  STUDENT25: 0.25,
  LAUNCH75: 0.75,
};

export function validatePromo(code: string): { valid: boolean; discount: number; code: string } {
  const norm = code.trim().toUpperCase();
  const discount = PROMO_CODES[norm];
  return discount ? { valid: true, discount, code: norm } : { valid: false, discount: 0, code: norm };
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
