"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";

const reviews = [
  { name: "Jure", company: "Microsoft", role: "Software Engineer", color: "from-emerald-300 to-emerald-500", quote: "I used InterviewAI to help me prepare for my interview. It's a great tool." },
  { name: "Sarah", company: "WrumerSound", role: "Support", color: "from-rose-300 to-rose-500", quote: "I've always wanted to work at WrumerSound. I finally nailed it with InterviewAI." },
  { name: "Akinwale", company: "Oracle", role: "Engineer", color: "from-amber-300 to-orange-500", quote: "InterviewAI prepares me for every interview I take. Worth every cent." },
  { name: "Anne", company: "Nike", role: "Marketing", color: "from-violet-300 to-fuchsia-500", quote: "There were a lot of questions in my interview. InterviewAI helped me answer them quickly." },
  { name: "John", company: "Nike", role: "Marketing", color: "from-sky-300 to-blue-500", quote: "The instant feedback helped me fix my weak answers fast. InterviewAI is my go-to." },
  { name: "Rahul", company: "Tata", role: "Sales", color: "from-cyan-300 to-teal-500", quote: "Cheap and easy to use. I recommend InterviewAI to anyone." },
  { name: "Anna", company: "Google", role: "Product Manager", color: "from-pink-300 to-rose-400", quote: "I had no experience with CS, but I still crushed the interviews using InterviewAI." },
  { name: "Ravi", company: "Random", role: "Assistant", color: "from-indigo-300 to-violet-500", quote: "I was asked random questions during my interview which InterviewAI helped me answer." },
  { name: "Mira", company: "Microsoft", role: "Engineer", color: "from-yellow-300 to-amber-500", quote: "I used InterviewAI to prepare and the result was great." },
];

function ReviewCard({ r }: { r: (typeof reviews)[number] }) {
  return (
    <article className="w-[260px] shrink-0 rounded-2xl bg-white p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]">
      <div className="flex items-center gap-2.5">
        <div className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${r.color} text-[12px] font-bold text-white`}>
          {r.name[0]}
        </div>
        <div className="text-[15px] font-bold text-neutral-950">{r.name}</div>
      </div>
      <p className="mt-3 text-[13px] leading-[1.5] text-neutral-700">{r.quote}</p>
      <div className="mt-3 flex items-center gap-1.5 text-[12.5px]">
        <span className="grid h-4 w-4 place-items-center rounded-sm bg-neutral-100 text-[8px] font-bold text-neutral-600">
          {r.company[0]}
        </span>
        <span className="font-semibold text-neutral-900">{r.company}</span>
        <span className="text-neutral-500"> - {r.role}</span>
      </div>
    </article>
  );
}

function SignInForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const error = params.get("error");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<null | "google" | "email">(null);

  async function handleGoogle() {
    setLoading("google");
    await signIn("google", { callbackUrl });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    // Email/password not configured — direct user to use Google for now.
    alert(
      "Email sign-in isn't configured yet. Please sign in with Google.\n\n(Tip: enable an email provider in src/auth.ts to support magic links or email/password.)",
    );
  }

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
      <h1 className="text-center text-[22px] font-bold text-neutral-950">Sign In</h1>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12.5px] text-rose-700">
          Sign-in failed. Please try again.
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-lg bg-neutral-950 py-3 text-[14px] font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {loading === "google" ? (
          <svg viewBox="0 0 50 50" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="4">
            <circle cx="25" cy="25" r="20" strokeOpacity="0.3" />
            <path d="M45 25a20 20 0 0 0-20-20" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 48 48" className="h-4 w-4">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.1 6.6 4.8c1.8-4.4 6.1-7.5 11.1-7.5 3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.1z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2L31.4 33c-2 1.5-4.6 2.4-7.4 2.4-5.1 0-9.5-3.3-11.2-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2c-.4.4 6.8-5 6.8-14.7 0-1.3-.1-2.3-.4-3.5z" />
          </svg>
        )}
        {loading === "google" ? "Redirecting…" : "Sign in with Google"}
      </button>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-[12.5px] text-neutral-500">or continue with email</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <form className="mt-5 flex gap-2" onSubmit={handleEmail}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[13.5px] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
        />
        <button
          type="submit"
          className="grid h-[42px] w-[42px] place-items-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
            <path d="M10.6 4.4 9.2 5.8l3.3 3.3H3v2h9.5l-3.3 3.3 1.4 1.4L16.4 10z" />
          </svg>
        </button>
      </form>

      <p className="mt-5 text-center text-[11.5px] leading-relaxed text-neutral-500">
        You can only be logged in on one desktop and one mobile device at a time.
        Logging in on another device will sign you out from the previous device of the same type.
      </p>
    </div>
  );
}

export default function SignInPage() {
  const col1 = [...reviews, ...reviews];
  const col2 = [...reviews.slice(3), ...reviews.slice(0, 3), ...reviews];
  const col3 = [...reviews.slice(6), ...reviews.slice(0, 6), ...reviews];

  return (
    <div className="flex min-h-screen overflow-hidden bg-white">
      <div className="flex w-full flex-col bg-white px-8 py-8 md:w-1/2 md:px-14">
        <Link href="/" className="flex items-center gap-2 self-start">
          <span className="text-2xl">🦜</span>
          <span className="text-[16px] font-bold tracking-tight text-neutral-950">
            InterviewAI
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 items-center">
          <Suspense fallback={<div className="h-[300px] w-full animate-pulse rounded-2xl bg-neutral-100" />}>
            <SignInForm />
          </Suspense>
        </div>
      </div>

      <div className="bg-signin-art relative hidden flex-1 overflow-hidden md:block">
        <div className="absolute inset-0 grid grid-cols-3 gap-4 px-6 py-6">
          <div className="flex flex-col gap-4">
            <div className="animate-marquee-y flex flex-col gap-4">
              {col1.map((r, i) => <ReviewCard key={i} r={r} />)}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="animate-marquee-y-rev -translate-y-1/4 flex flex-col gap-4">
              {col2.map((r, i) => <ReviewCard key={i} r={r} />)}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="animate-marquee-y flex flex-col gap-4 [animation-duration:50s]">
              {col3.map((r, i) => <ReviewCard key={i} r={r} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
