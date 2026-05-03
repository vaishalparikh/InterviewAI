"use client";

import { useMemo, useState } from "react";
import AppTopBar from "@/components/app/AppTopBar";
import CheckoutModal, { CheckoutPlan } from "@/components/app/CheckoutModal";
import { store, useStore, validatePromo } from "@/lib/store";

type Tab = "subscription" | "credits" | "lifetime";

type DisplayPlan = {
  id: string;
  type: "subscription" | "credits" | "lifetime";
  name: string;
  listPrice: number;
  period?: "month" | "year" | "one-time" | "credit-pack";
  credits?: number;
  features: string[];
  featured?: boolean;
  badge?: string;
};

const subscriptionPlans: DisplayPlan[] = [
  {
    id: "monthly",
    type: "subscription",
    name: "Pro Monthly",
    listPrice: 49,
    period: "month",
    features: ["Unlimited live sessions", "All AI models (GPT-5, Claude 4)", "Resume + docs grounding", "100+ languages", "Cancel anytime"],
  },
  {
    id: "yearly",
    type: "subscription",
    name: "Pro Yearly",
    listPrice: 149,
    period: "year",
    features: ["Unlimited live sessions", "All AI models (GPT-5, Claude 4)", "Resume + docs grounding", "100+ languages", "Save 75% vs monthly"],
    featured: true,
    badge: "Most Popular · Save 75%",
  },
];

const creditPlans: DisplayPlan[] = [
  {
    id: "starter",
    type: "credits",
    name: "Starter · 10 credits",
    listPrice: 9,
    period: "credit-pack",
    credits: 10,
    features: ["20 sessions of 30 min", "Never expires", "All AI models"],
  },
  {
    id: "pro-credits",
    type: "credits",
    name: "Pro · 50 credits",
    listPrice: 29,
    period: "credit-pack",
    credits: 50,
    features: ["100 sessions of 30 min", "Never expires", "All AI models", "Priority support"],
    featured: true,
    badge: "Best Value",
  },
  {
    id: "power",
    type: "credits",
    name: "Power · 200 credits",
    listPrice: 79,
    period: "credit-pack",
    credits: 200,
    features: ["400 sessions of 30 min", "Never expires", "All AI models", "Priority support"],
  },
];

const lifetimePlans: DisplayPlan[] = [
  {
    id: "lifetime",
    type: "lifetime",
    name: "Lifetime",
    listPrice: 299,
    period: "one-time",
    features: ["Unlimited calls forever", "All future AI models", "All updates included", "One-time payment"],
    featured: true,
    badge: "Pay once · Forever",
  },
];

export default function UpgradePage() {
  const plan = useStore((s) => s.plan);
  const invoices = useStore((s) => s.invoices);
  const [tab, setTab] = useState<Tab>("subscription");
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [checkout, setCheckout] = useState<CheckoutPlan | null>(null);

  const items = tab === "subscription" ? subscriptionPlans : tab === "credits" ? creditPlans : lifetimePlans;

  function applyPromo(e: React.FormEvent) {
    e.preventDefault();
    const result = validatePromo(promo);
    if (result.valid) {
      setAppliedPromo({ code: result.code, discount: result.discount });
      setPromoMessage({ type: "ok", text: `${Math.round(result.discount * 100)}% off applied 🎉` });
    } else {
      setAppliedPromo(null);
      setPromoMessage({ type: "err", text: "That code isn't valid." });
    }
  }

  function clearPromo() {
    setAppliedPromo(null);
    setPromo("");
    setPromoMessage(null);
  }

  function handleSelect(p: DisplayPlan) {
    setCheckout({
      type: p.type,
      name: p.name,
      listPrice: p.listPrice,
      period: p.period,
      credits: p.credits,
      features: p.features,
    });
  }

  const isCurrentPlan = (p: DisplayPlan) => plan.name === p.name;

  return (
    <>
      <AppTopBar
        title="Upgrade Plan"
        icon={
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        }
      />

      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="mx-auto max-w-5xl">
          {/* Current plan banner */}
          <CurrentPlanBanner />

          {/* Tabs */}
          <div className="mb-7 mt-10 flex justify-center">
            <div className="inline-flex rounded-full border border-neutral-200 bg-white p-1">
              {(["subscription", "credits", "lifetime"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-5 py-2 text-[13px] font-semibold capitalize transition ${
                    tab === t ? "bg-neutral-950 text-white" : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Promo */}
          <form onSubmit={applyPromo} className="mx-auto mb-7 flex max-w-xl items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
              <span aria-hidden>🎟️</span>
              <input
                value={promo}
                onChange={(e) => {
                  setPromo(e.target.value);
                  setPromoMessage(null);
                }}
                placeholder="Promo code (try INTERVIEW50)"
                className="flex-1 bg-transparent text-[13.5px] uppercase placeholder:normal-case placeholder:text-neutral-400 focus:outline-none"
              />
              {appliedPromo && (
                <button
                  type="button"
                  onClick={clearPromo}
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded-xl bg-neutral-950 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-neutral-800"
            >
              Apply
            </button>
          </form>
          {promoMessage && (
            <div className="mx-auto mb-5 max-w-xl text-center">
              <span
                className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${
                  promoMessage.type === "ok"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                }`}
              >
                {promoMessage.text}
              </span>
            </div>
          )}

          {/* Plans */}
          <div
            className={`grid gap-4 ${
              items.length === 1
                ? "mx-auto max-w-md"
                : items.length === 2
                  ? "mx-auto max-w-3xl md:grid-cols-2"
                  : "md:grid-cols-3"
            }`}
          >
            {items.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                discount={appliedPromo?.discount ?? 0}
                isCurrent={isCurrentPlan(p)}
                onSelect={() => handleSelect(p)}
              />
            ))}
          </div>

          {/* Billing history */}
          {invoices.length > 0 && (
            <section className="mt-14">
              <h3 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-neutral-500">
                Billing history
              </h3>
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 border-b border-neutral-100 bg-neutral-50/60 px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-wider text-neutral-500">
                  <div>Plan</div>
                  <div>Amount</div>
                  <div>Date</div>
                  <div>Status</div>
                </div>
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 border-b border-neutral-100 px-5 py-3 text-[13px] last:border-b-0"
                  >
                    <div className="font-semibold text-neutral-900">{inv.planName}</div>
                    <div className="text-neutral-700">${inv.amount.toFixed(2)}</div>
                    <div className="text-neutral-700">
                      {new Date(inv.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <div>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          inv.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200"
                        }`}
                      >
                        {inv.status === "paid" ? "Paid" : "Refunded"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Payment methods */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "UPI", "PhonePe"].map((m) => (
              <span
                key={m}
                className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-600"
              >
                {m}
              </span>
            ))}
          </div>
          <p className="mt-5 text-center text-[12px] text-neutral-500">
            30-day money-back guarantee · Cancel anytime · Secure checkout
          </p>
        </div>
      </main>

      <CheckoutModal
        plan={checkout}
        promoCode={appliedPromo?.code}
        discount={appliedPromo?.discount ?? 0}
        onClose={() => setCheckout(null)}
      />
    </>
  );
}

function CurrentPlanBanner() {
  const plan = useStore((s) => s.plan);
  const renews = plan.renewsAt ? new Date(plan.renewsAt) : null;

  if (plan.type === "free") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Current plan</span>
            <h2 className="mt-1 text-[22px] font-bold tracking-tight text-neutral-950">Free Plan</h2>
            <p className="mt-1 text-[13.5px] text-neutral-600">
              You're using the free tier. Upgrade for unlimited sessions, all AI models, and resume grounding.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-neutral-600 ring-1 ring-neutral-200">
              10 min sessions
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-neutral-950 bg-neutral-950 p-6 text-white sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Active plan</span>
          <h2 className="mt-1 text-[22px] font-bold tracking-tight text-white">{plan.name}</h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-neutral-300">
            <div>Paid <span className="font-semibold text-white">${plan.amountPaid.toFixed(2)}</span></div>
            {plan.startedAt && (
              <div>Started {new Date(plan.startedAt).toLocaleDateString()}</div>
            )}
            {renews && <div>Renews {renews.toLocaleDateString()}</div>}
            {plan.credits != null && (
              <div>Credits remaining: <span className="font-semibold text-white">{plan.credits}</span></div>
            )}
            {plan.promoCode && (
              <div>
                Promo: <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px]">{plan.promoCode}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => {
              if (confirm("Cancel and revert to the Free Plan?")) store.cancelPlan();
            }}
            className="rounded-lg border border-white/20 bg-white/5 px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-white/10"
          >
            Cancel plan
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  discount,
  isCurrent,
  onSelect,
}: {
  plan: DisplayPlan;
  discount: number;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const hasDiscount = discount > 0;
  const finalPrice = +(plan.listPrice * (1 - discount)).toFixed(2);

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-7 ${
        plan.featured
          ? "border-2 border-neutral-950 bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)]"
          : "border border-neutral-200 bg-white"
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-950 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {plan.badge}
        </span>
      )}
      <h3 className="text-[14px] font-bold text-neutral-700">{plan.name}</h3>
      <div className="mt-3 flex items-baseline gap-1.5">
        {hasDiscount && (
          <span className="text-[20px] font-bold text-neutral-300 line-through">${plan.listPrice}</span>
        )}
        <span className="text-[40px] font-bold tracking-tightest text-neutral-950">
          ${finalPrice}
        </span>
        <span className="text-[13px] text-neutral-500">
          {plan.period === "month" && "/month"}
          {plan.period === "year" && "/year"}
          {plan.period === "one-time" && "one-time"}
          {plan.period === "credit-pack" && "credits"}
        </span>
      </div>
      {hasDiscount && (
        <span className="mt-1 inline-flex w-fit rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
          You save ${(plan.listPrice - finalPrice).toFixed(2)}
        </span>
      )}
      <ul className="mt-6 flex flex-col gap-2.5 text-[13.5px]">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-neutral-700">
            <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="currentColor">
              <path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        disabled={isCurrent}
        className={`mt-7 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-[13.5px] font-semibold transition ${
          isCurrent
            ? "cursor-not-allowed bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            : plan.featured
              ? "bg-neutral-950 text-white hover:bg-neutral-800"
              : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
        }`}
      >
        {isCurrent ? "✓ Current plan" : `Get ${plan.name.split("·")[0].trim()}`}
      </button>
    </div>
  );
}
