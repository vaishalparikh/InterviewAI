type IconProps = { className?: string };
type PlatformIcon = (props: IconProps) => React.JSX.Element;

const VideoIcon: PlatformIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <rect x="3" y="6" width="13" height="12" rx="2.5" />
    <path d="M16 10l5-2.5v9L16 14z" />
  </svg>
);
const TeamsIcon: PlatformIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M5 4h12v3h-4v10h-4V7H5z" />
    <circle cx="18.5" cy="8" r="2.5" />
    <path d="M16 12h5v5a3 3 0 01-3 3 3 3 0 01-3-3v-3a2 2 0 011-2z" />
  </svg>
);
const ChatIcon: PlatformIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M4 5h16a2 2 0 012 2v8a2 2 0 01-2 2h-7l-5 4v-4H4a2 2 0 01-2-2V7a2 2 0 012-2z" />
  </svg>
);
const ChimeIcon: PlatformIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2a6 6 0 016 6v4l2 3H4l2-3V8a6 6 0 016-6zm-2 18h4a2 2 0 11-4 0z" />
  </svg>
);
const CodeIcon: PlatformIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 7 3 12 9 17" />
    <polyline points="15 7 21 12 15 17" />
  </svg>
);
const LeetIcon: PlatformIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M14 3l-9 9 5 5 4-4-2-2-2 2-1-1 6-6z" />
    <rect x="9" y="14" width="11" height="2.5" rx="1.25" />
  </svg>
);
const PhoneIcon: PlatformIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M6.6 2.7a2 2 0 012.8 0l2 2a2 2 0 010 2.8L10 9a13 13 0 005 5l1.5-1.4a2 2 0 012.8 0l2 2a2 2 0 010 2.8l-1.5 1.5a3 3 0 01-3 .8A19 19 0 014 7.5a3 3 0 01.8-3z" />
  </svg>
);

const stealth = [
  "Invisible on screen share",
  "Invisible in dock & taskbar",
  "Invisible to task manager",
  "Survives tab switching",
  "Cursor undetectability",
  "Generic process name",
];

const platforms: { name: string; color: string; Icon: PlatformIcon }[] = [
  { name: "Zoom", color: "bg-blue-500", Icon: VideoIcon },
  { name: "Google Meet", color: "bg-emerald-500", Icon: VideoIcon },
  { name: "Microsoft Teams", color: "bg-indigo-500", Icon: TeamsIcon },
  { name: "Webex", color: "bg-cyan-500", Icon: ChatIcon },
  { name: "Amazon Chime", color: "bg-orange-500", Icon: ChimeIcon },
  { name: "HackerRank", color: "bg-emerald-600", Icon: CodeIcon },
  { name: "LeetCode", color: "bg-amber-500", Icon: LeetIcon },
  { name: "Google Voice", color: "bg-rose-500", Icon: PhoneIcon },
];

export default function Privacy() {
  return (
    <section id="privacy" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-700">
          Privacy first
        </span>
        <h2 className="mt-4 text-balance text-[36px] font-bold leading-[1.1] tracking-tightest text-neutral-950 sm:text-[44px]">
          100% private and undetectable
        </h2>
        <p className="mt-4 text-pretty text-[16px] leading-relaxed text-neutral-600">
          Runs at the system level with native window-capture exclusion. Nothing shows
          up in screen recordings, screen shares, or proctoring software.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {stealth.map((p) => (
          <div
            key={p}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3.5"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" />
              </svg>
            </span>
            <span className="text-[14px] font-medium text-neutral-800">{p}</span>
          </div>
        ))}
      </div>

      {/* Platform compatibility grid */}
      <div className="mt-14">
        <h3 className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
          Live platform compatibility status
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span className={`grid h-8 w-8 place-items-center rounded-lg text-white ring-1 ring-black/5 ${p.color}`}>
                  <p.Icon className="h-4 w-4" />
                </span>
                <span className="text-[13.5px] font-bold text-neutral-900">{p.name}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Undetectable
                </span>
                <span className="text-neutral-400">checked 13h ago</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
