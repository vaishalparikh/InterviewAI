"use client";

import { useEffect, useState } from "react";
import { store, useStore } from "@/lib/store";

type Step = "form" | "documents" | "language" | "auto" | "ready";

type Draft = {
  type: "interview" | "regular";
  jobUrl: string;
  company: string;
  callTitle: string; // for regular calls
  description: string;
  resumeName: string;
  documentIds: string[];
  language: string;
  simpleLanguage: boolean;
  extraContext: string;
  aiModel: string;
  autoGenerate: boolean;
};

const initialDraft = (resumeName: string): Draft => ({
  type: "interview",
  jobUrl: "",
  company: "",
  callTitle: "",
  description: "",
  resumeName,
  documentIds: [],
  language: "English",
  simpleLanguage: true,
  extraContext: "",
  aiModel: "GPT-4.1 Mini",
  autoGenerate: false,
});

type Props = {
  open: boolean;
  free?: boolean;
  onClose: () => void;
  onCreated?: (sessionId: string) => void;
};

export default function CreateSessionModal({ open, free = true, onClose, onCreated }: Props) {
  const resumes = useStore((s) => s.resumes);
  const documents = useStore((s) => s.documents);
  const [step, setStep] = useState<Step>("form");
  const [draft, setDraft] = useState<Draft>(() =>
    initialDraft(resumes[0]?.name ?? ""),
  );

  // when modal opens, default to first resume if user has one
  useEffect(() => {
    if (open) {
      setStep("form");
      setDraft(initialDraft(resumes[0]?.name ?? ""));
    }
  }, [open, resumes]);

  if (!open) return null;

  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  function handleCreate() {
    const isInterview = draft.type === "interview";
    const session = store.createSession({
      title:
        (isInterview ? draft.company : draft.callTitle).trim() ||
        (isInterview ? "Untitled" : "Regular Call"),
      description:
        draft.description.trim() || (isInterview ? "Interview" : "Call"),
      mode: draft.type,
      jobUrl: isInterview ? draft.jobUrl || undefined : undefined,
      resumeName: isInterview ? draft.resumeName || undefined : undefined,
      documentIds: draft.documentIds,
      language: draft.language,
      simpleLanguage: draft.simpleLanguage,
      extraContext: draft.extraContext || undefined,
      aiModel: draft.aiModel,
      autoGenerate: draft.autoGenerate,
      free,
    });
    onCreated?.(session.id);
    onClose();
  }

  // Interview requires company + description; Regular Call is fully optional
  const formValid =
    draft.type === "regular" ||
    (draft.company.trim().length > 0 && draft.description.trim().length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[560px] rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        {step === "form" && (
          <FormStep
            draft={draft}
            update={update}
            free={free}
            valid={formValid}
            resumes={resumes}
            onClose={onClose}
            onNext={() => setStep("documents")}
          />
        )}
        {step === "documents" && (
          <DocumentsStep
            draft={draft}
            update={update}
            documents={documents}
            onClose={onClose}
            onBack={() => setStep("form")}
            onNext={() => setStep("language")}
          />
        )}
        {step === "language" && (
          <LanguageStep
            draft={draft}
            update={update}
            onClose={onClose}
            onBack={() => setStep("documents")}
            onNext={() => setStep("auto")}
          />
        )}
        {step === "auto" && (
          <AutoStep
            draft={draft}
            update={update}
            onClose={onClose}
            onBack={() => setStep("language")}
            onNext={() => setStep("ready")}
          />
        )}
        {step === "ready" && (
          <ReadyStep
            free={free}
            draft={draft}
            onClose={onClose}
            onBack={() => setStep("auto")}
            onCreate={handleCreate}
          />
        )}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-7 pb-2 pt-7">
      <h2 className="text-[18px] font-bold text-neutral-950">{title}</h2>
      <button
        onClick={onClose}
        className="grid h-7 w-7 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
          <path d="m4 5.4 1.4-1.4L10 8.6 14.6 4l1.4 1.4L11.4 10 16 14.6 14.6 16 10 11.4 5.4 16 4 14.6 8.6 10z" />
        </svg>
      </button>
    </div>
  );
}

function ModalFooter({
  onBack,
  onClose,
  onNext,
  nextLabel = "Next →",
  nextDisabled,
  closeLabel = "Close",
}: {
  onBack?: () => void;
  onClose?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  closeLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-7 pb-7 pt-5">
      <button
        onClick={onBack ?? onClose}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white py-2.5 text-[13.5px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
      >
        {onBack ? "← Back" : closeLabel}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-950 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-neutral-800 disabled:bg-neutral-300 disabled:hover:bg-neutral-300"
      >
        {nextLabel}
      </button>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-neutral-900">
      {children}
    </label>
  );
}

/* ---------- Step 1: Form ---------- */
function FormStep({
  draft,
  update,
  free,
  valid,
  resumes,
  onClose,
  onNext,
}: {
  draft: Draft;
  update: (p: Partial<Draft>) => void;
  free: boolean;
  valid: boolean;
  resumes: ReturnType<typeof useStore<{ name: string }[]>> extends infer T ? any : never;
  onClose: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <ModalHeader title={free ? "Free Session (10 min)" : "Start Session"} onClose={onClose} />
      <div className="space-y-5 px-7">
        <div>
          <FieldLabel>Session Type</FieldLabel>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-neutral-100 p-1">
            <button
              onClick={() => update({ type: "interview" })}
              className={`flex items-center justify-center gap-2 rounded-md py-2 text-[13.5px] font-semibold transition ${
                draft.type === "interview"
                  ? "bg-white text-neutral-950 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              💼 Interview
            </button>
            <button
              onClick={() => update({ type: "regular" })}
              className={`flex items-center justify-center gap-2 rounded-md py-2 text-[13.5px] font-semibold transition ${
                draft.type === "regular"
                  ? "bg-white text-neutral-950 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              📞 Regular Call
            </button>
          </div>
        </div>

        {draft.type === "interview" ? (
          <>
            <div>
              <FieldLabel>Job Post URL <span className="text-[12px] font-normal text-neutral-500">(Optional)</span></FieldLabel>
              <input
                value={draft.jobUrl}
                onChange={(e) => update({ jobUrl: e.target.value })}
                placeholder="https://company.com/jobs/123"
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
              />
            </div>

            <div className="text-center text-[12px] text-neutral-400">— or input manually —</div>

            <div>
              <FieldLabel>💼 Company *</FieldLabel>
              <input
                value={draft.company}
                onChange={(e) => update({ company: e.target.value })}
                placeholder="Microsoft..."
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
              />
            </div>

            <div>
              <FieldLabel>📄 Job Description *</FieldLabel>
              <textarea
                value={draft.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Software Engineer versed in Python, SQL, and AWS..."
                rows={3}
                className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
              />
            </div>

            <div>
              <FieldLabel>📎 Resume</FieldLabel>
              {resumes.length > 0 ? (
                <select
                  value={draft.resumeName}
                  onChange={(e) => update({ resumeName: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] focus:border-neutral-400 focus:outline-none"
                >
                  <option value="">— No resume —</option>
                  {resumes.map((r: any) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-dashed border-neutral-300 bg-neutral-50/60 px-3 py-2 text-[12.5px] text-neutral-500">
                  <span>No resume uploaded</span>
                  <a href="/dashboard/resumes" className="font-semibold text-neutral-900 underline-offset-2 hover:underline">Upload</a>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Regular Call mode */}
            <div>
              <FieldLabel>📝 Call Title <span className="text-[12px] font-normal text-neutral-500">(Optional)</span></FieldLabel>
              <input
                value={draft.callTitle}
                onChange={(e) => update({ callTitle: e.target.value })}
                placeholder="Feature request discussion..."
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
              />
            </div>

            <div>
              <FieldLabel>📄 Description <span className="text-[12px] font-normal text-neutral-500">(Optional)</span></FieldLabel>
              <textarea
                value={draft.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Discussing Q4 targets and partnership opportunities..."
                rows={4}
                className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
              />
            </div>

            <p className="text-[12.5px] leading-relaxed text-neutral-500">
              💡 Regular calls are for everyday meetings — sales calls, customer support, internal discussions. The AI will help you take notes and suggest responses without using interview-specific frameworks.
            </p>
          </>
        )}
      </div>
      <ModalFooter onClose={onClose} onNext={onNext} nextDisabled={!valid} />
    </>
  );
}

/* ---------- Step 2: Documents ---------- */
function DocumentsStep({
  draft,
  update,
  documents,
  onClose,
  onBack,
  onNext,
}: {
  draft: Draft;
  update: (p: Partial<Draft>) => void;
  documents: { id: string; name: string }[];
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function toggle(id: string) {
    const set = new Set(draft.documentIds);
    if (set.has(id)) set.delete(id); else set.add(id);
    update({ documentIds: Array.from(set) });
  }

  return (
    <>
      <ModalHeader title="Documents" onClose={onClose} />
      <div className="space-y-3 px-7">
        <FieldLabel>📁 Documents</FieldLabel>
        {documents.length === 0 ? (
          <div className="flex items-center justify-between rounded-lg border border-dashed border-neutral-300 bg-neutral-50/60 px-3 py-3 text-[12.5px]">
            <span className="text-neutral-500">No documents uploaded yet</span>
            <a href="/dashboard/documents" className="font-semibold text-neutral-900 underline-offset-2 hover:underline">Add document</a>
          </div>
        ) : (
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {documents.map((d) => (
              <label
                key={d.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={draft.documentIds.includes(d.id)}
                  onChange={() => toggle(d.id)}
                />
                <span className="truncate text-neutral-900">{d.name}</span>
              </label>
            ))}
          </div>
        )}
        <p className="text-[13px] leading-relaxed text-neutral-500">
          Select documents to give AI additional context during your session. The AI will reference these documents when generating responses, helping it provide more accurate and relevant answers.
        </p>
      </div>
      <ModalFooter onBack={onBack} onNext={onNext} />
    </>
  );
}

/* ---------- Step 3: Language ---------- */
function LanguageStep({
  draft,
  update,
  onClose,
  onBack,
  onNext,
}: {
  draft: Draft;
  update: (p: Partial<Draft>) => void;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <ModalHeader title="Language & AI Settings" onClose={onClose} />
      <div className="space-y-5 px-7">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>🌐 Language</FieldLabel>
            <select
              value={draft.language}
              onChange={(e) => update({ language: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] focus:border-neutral-400 focus:outline-none"
            >
              {["English", "Spanish", "French", "German", "Hindi", "Mandarin", "Japanese"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Simple Language</FieldLabel>
            <button
              type="button"
              onClick={() => update({ simpleLanguage: !draft.simpleLanguage })}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                draft.simpleLanguage ? "bg-neutral-950" : "bg-neutral-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  draft.simpleLanguage ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div>
          <FieldLabel>Extra Context / Instructions</FieldLabel>
          <textarea
            value={draft.extraContext}
            onChange={(e) => update({ extraContext: e.target.value })}
            placeholder="Be more technical, use a more casual tone, use JavaScript when generating code examples, etc."
            rows={3}
            className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
        </div>

        <div>
          <FieldLabel>🤖 AI Model</FieldLabel>
          <select
            value={draft.aiModel}
            onChange={(e) => update({ aiModel: e.target.value })}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] focus:border-neutral-400 focus:outline-none"
          >
            <option>GPT-4.1 Mini</option>
            <option>GPT-4.1</option>
            <option>GPT-5</option>
            <option>Claude 4 Sonnet</option>
            <option>Claude 4 Opus</option>
          </select>
        </div>
      </div>
      <ModalFooter onBack={onBack} onNext={onNext} />
    </>
  );
}

/* ---------- Step 4: Auto ---------- */
function AutoStep({
  draft,
  update,
  onClose,
  onBack,
  onNext,
}: {
  draft: Draft;
  update: (p: Partial<Draft>) => void;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <ModalHeader title="Auto Generate AI Response" onClose={onClose} />
      <div className="px-7">
        <div className="flex items-center gap-3">
          <span className="text-[13.5px] font-semibold text-neutral-900">
            Auto Generate AI Response
          </span>
          <button
            type="button"
            onClick={() => update({ autoGenerate: !draft.autoGenerate })}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
              draft.autoGenerate ? "bg-neutral-950" : "bg-neutral-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                draft.autoGenerate ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="rounded-full border-[1.5px] border-emerald-500/70 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            New
          </span>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
          If you check this option, the AI will automatically detect when the interviewer asks you a question and generate a response. If you don't check this option, you will need to click the "AI Help" button to generate a response.
        </p>
      </div>
      <ModalFooter onBack={onBack} onNext={onNext} />
    </>
  );
}

/* ---------- Step 5: Ready ---------- */
function ReadyStep({
  free,
  draft,
  onClose,
  onBack,
  onCreate,
}: {
  free: boolean;
  draft: Draft;
  onClose: () => void;
  onBack: () => void;
  onCreate: () => void;
}) {
  return (
    <>
      <ModalHeader title="Ready to Create" onClose={onClose} />
      <div className="space-y-3 px-7">
        {free && <p className="text-[14px] text-neutral-900">⏰ This is a 10 minute free session.</p>}
        <p className="text-[13.5px] leading-relaxed text-neutral-700">
          The timer will not start until you connect your screen sharing.
        </p>
        {free && (
          <p className="text-[13.5px] leading-relaxed text-neutral-700">
            You won't be able to create another free session for the next 12 minutes.
          </p>
        )}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-3 text-[12.5px]">
          <div className="font-semibold text-neutral-900">
            {draft.type === "interview"
              ? draft.company || "Untitled"
              : draft.callTitle || "Regular Call"}
          </div>
          <div className="mt-0.5 truncate text-neutral-600">{draft.description || "—"}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-700 ring-1 ring-neutral-200">
              {draft.type === "interview" ? "💼 Interview" : "📞 Regular Call"}
            </span>
            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-700 ring-1 ring-neutral-200">
              {draft.aiModel}
            </span>
            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-700 ring-1 ring-neutral-200">
              {draft.language}
            </span>
            {draft.autoGenerate && (
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                Auto AI
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-7 pb-7 pt-5">
        <button
          onClick={onBack}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white py-2.5 text-[13.5px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
        >
          ← Back
        </button>
        <button
          onClick={onCreate}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-950 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-neutral-800"
        >
          Create {free ? "Free " : ""}Session
        </button>
      </div>
    </>
  );
}
