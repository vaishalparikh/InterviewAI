# InterviewAI

A real-time AI interview copilot — a fully working clone of [ParakeetAI](https://www.parakeet-ai.com), built end-to-end with Next.js 15, React 19, and Tailwind CSS.

Marketing landing, sign-in, dashboard, sessions list, multi-step session creation, live coaching screen, resume + documents uploads, and a complete upgrade/billing flow with promo codes — all wired together with `localStorage`-backed state so the entire app works without a backend.

---

## Demo flow

1. **Landing** (`/`) — hero, features, product shot, privacy, pricing, FAQ, footer. Every CTA routes to `/signin`.
2. **Sign in** (`/signin`) — Google button or email submit. Animated 3-column testimonial wall on the right rail.
3. **Dashboard** (`/app`) — greeting, 4-step onboarding guide, "Where did you hear about us?" grid.
4. **Create session** — 5-step modal (Form → Documents → Language & AI → Auto-Generate → Ready). Validates inputs, collects all data, persists to store.
5. **Sessions list** (`/app/sessions`) — table with status pills (Free / Live / Ended), edit + connect actions.
6. **Live session** (`/app/sessions/[id]`) — timer, simulated transcript stream, dark AI response panel with typewriter streaming, AI Help / End buttons.
7. **Upgrade** (`/app/upgrade`) — Subscription / Credits / Lifetime tabs, promo codes (`INTERVIEW50`, `STUDENT25`, `LAUNCH75`), real-time price preview, mock checkout (card form → processing → success), billing history, cancel plan.
8. **Sidebar** updates dynamically — Free Plan card flips to a dark "Pro · Active" card showing renewal date and remaining credits the moment a plan is purchased.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Font | Inter (`next/font/google`) |
| State | Custom `useSyncExternalStore` + `localStorage` |
| Package manager | Bun |
| Routing | File-based (`src/app/**`) |

No external state library, no backend, no auth provider — every interaction is real but persisted in the browser.

---

## Routes

| Route | Page |
|---|---|
| `/` | Marketing landing |
| `/signin` | Sign in (Google + email) |
| `/app` | Home dashboard |
| `/app/sessions` | Call sessions list |
| `/app/sessions/[id]` | Live session view (transcript + AI response) |
| `/app/resumes` | CVs / Resumes upload + manage |
| `/app/documents` | Knowledge base upload + manage |
| `/app/upgrade` | Upgrade plan / billing history |

`/app/*` is auth-gated — visiting any of those routes while logged out redirects to `/signin`.

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # root layout (Inter font)
│   ├── globals.css             # tailwind + utilities
│   ├── page.tsx                # marketing landing
│   ├── signin/page.tsx         # sign in
│   └── app/
│       ├── layout.tsx          # auth gate + sidebar shell
│       ├── page.tsx            # home dashboard
│       ├── sessions/
│       │   ├── page.tsx        # sessions list
│       │   └── [id]/page.tsx   # live session view
│       ├── resumes/page.tsx
│       ├── documents/page.tsx
│       └── upgrade/page.tsx    # plans + checkout
├── components/
│   ├── Nav.tsx, Hero.tsx, ...  # marketing sections
│   ├── LiveCoachingPreview.tsx # dark in-product mockup
│   └── app/
│       ├── AppSidebar.tsx      # dynamic plan card + nav + user menu
│       ├── AppTopBar.tsx
│       ├── CreateSessionModal.tsx     # 5-step state machine
│       ├── ChoosePlatformModal.tsx
│       └── CheckoutModal.tsx          # form → processing → success
└── lib/
    └── store.ts                # localStorage-backed app store
```

---

## Getting started

```bash
git clone https://github.com/vaishalparikh/InterviewAI.git
cd InterviewAI
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm`, `pnpm`, and `yarn` also work — `bun.lock` is committed but the project has no Bun-specific dependencies.

---

## Features

### Sign in
- Email validation
- Google sign-in (mocked — sets a session in `localStorage`)
- Already-signed-in users bounce straight to `/app`

### Sessions
- Multi-step modal collects company, job description, resume, documents, language, AI model, auto-generate preference
- Step 1 validates required fields before allowing Next
- Session preview card on the final step with all selected options as badges
- New sessions appear immediately in the list (cross-page reactive store)

### Live session
- 10-minute timer for free, 60-minute for paid
- Pre-canned interviewer questions stream every 12 seconds
- AI response streams character-by-character into a dark panel
- `AI Help` button when auto-generate is off; auto-streaming when on
- End session → status flips to "Ended", AI usage count updates, redirects back to list

### Resume + Documents
- Real `<input type="file" multiple>` upload
- File metadata (name, size, upload date) persisted
- Per-row delete

### Upgrade / billing
- Three plan tabs: Subscription, Credits, Lifetime
- Promo codes: `INTERVIEW50` (50% off), `STUDENT25` (25%), `LAUNCH75` (75%)
- Live discount preview with strikethrough list price + "You save $X" pill
- Mock card checkout (auto-formats card number / expiry, validates lengths)
- 1.2 s "processing" stage → success state
- Plan immediately reflected in the upgrade banner, the sidebar, and the billing history table
- Cancel plan reverts to Free; invoices remain as historical record
- "Current plan" shows ✓ on the active card and disables its button

### Persistence
Everything is stored in `localStorage` under `interviewai_state_v1`:

```ts
{
  user: { email, name } | null,
  sessions: Session[],
  resumes: Resume[],
  documents: Doc[],
  plan: Plan,           // Free / subscription / credits / lifetime
  invoices: Invoice[],  // billing history
}
```

Reactive across the whole app via `useSyncExternalStore` — even cross-tab via the `storage` event.

---

## Notes

- No real backend, no real AI calls. Transcripts and answers in the live session view are pre-canned strings replayed with a typewriter effect.
- No real payment processing. The checkout modal is a UI prototype — entered card data is discarded.
- Auth is `localStorage`-only. Sign-out clears the user; sessions, resumes, and invoices remain so they're visible after re-signing in.
- File uploads store metadata only (name, size, upload date). File contents are not retained.
- This is a UI clone for educational purposes. Refer to ParakeetAI's actual product and terms for any production use.

---

## License

Educational / personal use. Not affiliated with ParakeetAI.
