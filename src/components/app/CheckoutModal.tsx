"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/store";

export type CheckoutPlan = {
  type: "credits" | "subscription" | "lifetime";
  name: string;
  listPrice: number; // before promo
  period?: "month" | "year" | "one-time" | "credit-pack";
  credits?: number;
  features: string[];
};

type Props = {
  plan: CheckoutPlan | null;
  promoCode?: string;
  discount?: number; // 0..1
  onClose: () => void;
  onSuccess?: () => void;
};

type Stage = "form" | "processing" | "success";

export default function CheckoutModal({ plan, promoCode, discount = 0, onClose, onSuccess }: Props) {
  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    if (plan) {
      setStage("form");
      setName("");
      setCard("");
      setExp("");
      setCvc("");
    }
  }, [plan?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!plan) return null;

  const total = +(plan.listPrice * (1 - discount)).toFixed(2);
  const saved = +(plan.listPrice - total).toFixed(2);

  function formatCard(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  }
  function formatExp(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (card.replace(/\s/g, "").length < 12 || exp.length < 5 || cvc.length < 3 || !name.trim()) {
      alert("Please fill all card fields");
      return;
    }
    setStage("processing");
    setTimeout(() => {
      if (!plan) return;
      store.purchasePlan({
        type: plan.type,
        name: plan.name,
        listPrice: plan.listPrice,
        discount,
        period: plan.period,
        credits: plan.credits,
        promoCode: promoCode || undefined,
      });
      setStage("success");
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={stage !== "processing" ? onClose : undefined} />
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        {stage === "form" && (
          <>
            <div className="flex items-center justify-between px-7 pb-3 pt-7">
              <div>
                <h2 className="text-[18px] font-bold text-neutral-950">Complete purchase</h2>
                <p className="mt-0.5 text-[12.5px] text-neutral-500">Secure payment · powered by Stripe</p>
              </div>
              <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900">
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                  <path d="m4 5.4 1.4-1.4L10 8.6 14.6 4l1.4 1.4L11.4 10 16 14.6 14.6 16 10 11.4 5.4 16 4 14.6 8.6 10z" />
                </svg>
              </button>
            </div>

            <div className="px-7">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Order summary</div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <div className="text-[14px] font-semibold text-neutral-950">{plan.name}</div>
                  <div className="text-[14px] font-semibold text-neutral-950">${plan.listPrice.toFixed(2)}</div>
                </div>
                {discount > 0 && (
                  <div className="mt-1 flex items-baseline justify-between text-[12.5px] text-emerald-700">
                    <div>
                      Promo <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-emerald-200">{promoCode}</span>
                    </div>
                    <div>− ${saved.toFixed(2)}</div>
                  </div>
                )}
                <div className="mt-2 flex items-baseline justify-between border-t border-neutral-200 pt-2">
                  <div className="text-[13px] font-semibold text-neutral-700">Total today</div>
                  <div className="text-[20px] font-bold text-neutral-950">${total.toFixed(2)}</div>
                </div>
                {plan.period === "month" && <p className="mt-1 text-[11.5px] text-neutral-500">Renews monthly · cancel anytime</p>}
                {plan.period === "year" && <p className="mt-1 text-[11.5px] text-neutral-500">Renews annually · cancel anytime</p>}
                {plan.period === "one-time" && <p className="mt-1 text-[11.5px] text-neutral-500">One-time payment · forever access</p>}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 px-7 pb-7 pt-5">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-neutral-900">Name on card</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vaishal Parikh"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-neutral-900">Card number</label>
                <input
                  value={card}
                  onChange={(e) => setCard(formatCard(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 font-mono text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-neutral-900">Expiry</label>
                  <input
                    value={exp}
                    onChange={(e) => setExp(formatExp(e.target.value))}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 font-mono text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-neutral-900">CVC</label>
                  <input
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    inputMode="numeric"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 font-mono text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 py-3 text-[14px] font-semibold text-white transition hover:bg-neutral-800"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Pay ${total.toFixed(2)}
              </button>
              <p className="text-center text-[11px] text-neutral-500">
                30-day money-back guarantee · 256-bit encryption
              </p>
            </form>
          </>
        )}

        {stage === "processing" && (
          <div className="flex flex-col items-center gap-4 px-8 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center">
              <svg viewBox="0 0 50 50" className="h-10 w-10 animate-spin text-neutral-950" fill="none" stroke="currentColor" strokeWidth="4">
                <circle cx="25" cy="25" r="20" strokeOpacity="0.2" />
                <path d="M45 25a20 20 0 0 0-20-20" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-neutral-950">Processing your payment…</h2>
              <p className="mt-1 text-[13px] text-neutral-500">Please don't close this window.</p>
            </div>
          </div>
        )}

        {stage === "success" && (
          <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-neutral-950">You're upgraded! 🎉</h2>
              <p className="mt-1 max-w-xs text-[13px] text-neutral-600">
                Welcome to <span className="font-semibold">{plan.name}</span>. Your plan is active immediately.
              </p>
            </div>
            <button
              onClick={() => {
                onSuccess?.();
                onClose();
              }}
              className="mt-2 w-full rounded-xl bg-neutral-950 py-3 text-[14px] font-semibold text-white transition hover:bg-neutral-800"
            >
              Continue to your dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
