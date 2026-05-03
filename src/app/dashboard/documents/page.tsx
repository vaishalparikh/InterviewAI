"use client";

import { useRef } from "react";
import AppTopBar from "@/components/app/AppTopBar";
import { formatBytes, store, useStore } from "@/lib/store";

export default function DocumentsPage() {
  const documents = useStore((s) => s.documents);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f) => store.addDocument(f));
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <AppTopBar
        title="Documents"
        icon={
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        }
      />
      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="mx-auto max-w-3xl">
          <input
            ref={fileRef}
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
          />

          <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-white p-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-neutral-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <h2 className="mt-4 text-[18px] font-bold text-neutral-950">Knowledge Base</h2>
            <p className="mt-2 text-[13.5px] text-neutral-600">
              Upload PDFs, product docs, or notes. The AI will reference them when generating answers.
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-5 rounded-lg bg-neutral-950 px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-neutral-800"
            >
              Choose files
            </button>
          </div>

          {documents.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-neutral-500">
                Your documents ({documents.length})
              </h3>
              <div className="space-y-2">
                {documents.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-neutral-100 text-neutral-700">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-[14px] font-semibold text-neutral-950">{d.name}</div>
                      <div className="text-[12px] text-neutral-500">
                        {formatBytes(d.size)} · uploaded {new Date(d.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => store.removeDocument(d.id)}
                      className="rounded-md p-2 text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600"
                      title="Delete"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
