"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Which platforms does it work with?",
    a: "Zoom, Google Meet, Microsoft Teams, Webex, Amazon Chime, HackerRank, LeetCode, and even phone calls via Google Voice. Native apps for macOS and Windows, plus a mobile browser version.",
  },
  {
    q: "Is it visible during screen sharing?",
    a: "No. The assistant uses native window-capture exclusion APIs (NSWindowSharingNone on macOS, WDA_EXCLUDEFROMCAPTURE on Windows). It's invisible to screen share, screen recording, and proctoring tools.",
  },
  {
    q: "Will proctoring software detect it?",
    a: "Not in our verified compatibility list — we re-check every platform every 24 hours. That said, please verify your specific institution's policy before using on a proctored exam.",
  },
  {
    q: "Can I use it during online exams?",
    a: "Technically yes — but academic-integrity policies vary widely. You're responsible for compliance with your school's or employer's rules.",
  },
  {
    q: "Does it support coding interviews?",
    a: "Yes. Screen capture pulls the question from LeetCode, HackerRank or any browser editor, then returns a working solution with line-by-line explanation in real time.",
  },
  {
    q: "Can I use headphones?",
    a: "Yes. We capture system audio directly via virtual audio device, not speaker output, so wired or Bluetooth headphones both work.",
  },
  {
    q: "What languages are supported?",
    a: "100+ languages. The assistant transcribes and responds in the same language as the interviewer, switching automatically mid-call if needed.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — 10-minute sessions, renewable every 15 minutes. No credit card required.",
  },
  {
    q: "What's the refund policy?",
    a: "30-day money-back guarantee on initial purchases. Cancel anytime from your dashboard — no questions asked.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
      <div className="mb-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-700">
          Support
        </span>
        <h2 className="mt-4 text-balance text-[36px] font-bold leading-[1.1] tracking-tightest text-neutral-950 sm:text-[44px]">
          Frequently asked questions
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {faqs.map((f, i) => (
          <button
            key={i}
            onClick={() => setOpen(open === i ? null : i)}
            className={`flex w-full flex-col items-start px-6 py-5 text-left transition hover:bg-neutral-50/70 ${
              i !== faqs.length - 1 ? "border-b border-neutral-100" : ""
            }`}
          >
            <div className="flex w-full items-center justify-between gap-4">
              <span className="text-[14.5px] font-bold text-neutral-950">{f.q}</span>
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-700 transition ${
                  open === i ? "rotate-45 bg-neutral-950 text-white" : ""
                }`}
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
              </span>
            </div>
            <div
              className={`grid w-full overflow-hidden transition-[grid-template-rows] duration-300 ${
                open === i ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-[13.5px] leading-relaxed text-neutral-600">{f.a}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
