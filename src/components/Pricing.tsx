"use client";

import Link from "next/link";
import { useState } from "react";

type Tab = "credits" | "subscription" | "lifetime";

type Plan = {
  name: string;
  price: string;
  sub: string;
  perks: string[];
  featured?: boolean;
  badge?: string;
};

const plans: Record<Tab, Plan[]> = {
  credits: [
    {
      name: "Starter",
      price: "$9",
      sub: "10 credits",
      perks: ["20 sessions of 30 min", "Never expires", "All AI models"],
    },
    {
      name: "Pro",
      price: "$29",
      sub: "50 credits",
      perks: ["100 sessions of 30 min", "Never expires", "Priority support"],
      featured: true,
    },
    {
      name: "Power",
      price: "$79",
      sub: "200 credits",
      perks: ["400 sessions of 30 min", "Never expires", "Priority support"],
    },
  ],
  subscription: [
    {
      name: "Monthly",
      price: "$24",
      sub: "/month with code",
      perks: ["Unlimited calls", "All AI models", "Resume + docs grounding", "Cancel anytime"],
    },
    {
      name: "Yearly",
      price: "$74",
      sub: "/year with code",
      perks: ["Unlimited calls", "All AI models", "Resume + docs grounding", "Save 75%"],
      featured: true,
      badge: "Most Popular · Save 75%",
    },
  ],
  lifetime: [
    {
      name: "Lifetime",
      price: "$299",
      sub: "one-time",
      perks: ["Unlimited calls forever", "All future AI models", "All updates included"],
      featured: true,
      badge: "Best Value",
    },
  ],
};

export default function Pricing() {
  const [tab, setTab] = useState<Tab>("subscription");
  const items = plans[tab];

  return (
    <section
      id="pricing"
      className="mx-auto max-w-6xl px-5 py-24 sm:px-8"
    >
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-700">
          Pricing
        </span>
        <h2 className="mt-4 text-balance text-[36px] font-bold leading-[1.1] tracking-tightest text-neutral-950 sm:text-[44px]">
          Simple, honest pricing
        </h2>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-[12.5px] font-semibold text-amber-900">
          🎉 Use code <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-amber-200">INTERVIEW50</span> for 50% off
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex rounded-full border border-neutral-200 bg-white p-1">
          {(["credits", "subscription", "lifetime"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 text-[13px] font-semibold capitalize transition ${
                tab === t
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {t === "credits" ? "Credits" : t === "subscription" ? "Subscription" : "Lifetime"}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`mx-auto grid gap-4 ${
          items.length === 1
            ? "max-w-md"
            : items.length === 2
              ? "max-w-3xl md:grid-cols-2"
              : "md:grid-cols-3"
        }`}
      >
        {items.map((p) => (
          <PlanCard key={p.name} plan={p} />
        ))}
      </div>

      <div className="mt-14 flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "UPI", "PhonePe"].map((m) => (
            <span
              key={m}
              className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-600"
            >
              {m}
            </span>
          ))}
        </div>
        <p className="text-[13px] text-neutral-500">
          30-day money-back guarantee · Cancel anytime · Secure checkout
        </p>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const featured = !!plan.featured;
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-7 ${
        featured
          ? "border-2 border-neutral-950 bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)]"
          : "border border-neutral-200 bg-white"
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-neutral-950 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {plan.badge}
        </span>
      )}
      <h3 className="text-[14px] font-bold text-neutral-700">{plan.name}</h3>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[44px] font-bold tracking-tightest text-neutral-950">
          {plan.price}
        </span>
        <span className="text-[13px] text-neutral-500">{plan.sub}</span>
      </div>
      <ul className="mt-6 flex flex-col gap-2.5 text-[13.5px]">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-neutral-700">
            <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="currentColor">
              <path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" />
            </svg>
            {perk}
          </li>
        ))}
      </ul>
      <Link
        href="/signin"
        className={`mt-7 inline-flex items-center justify-center rounded-xl px-4 py-3 text-[13.5px] font-semibold transition ${
          featured
            ? "bg-neutral-950 text-white hover:bg-neutral-800"
            : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
        }`}
      >
        Get started →
      </Link>
    </div>
  );
}
