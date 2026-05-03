"use client";

type Props = {
  title: string;
  icon?: React.ReactNode;
  onStartFree?: () => void;
  onStart?: () => void;
};

export default function AppTopBar({ title, icon, onStartFree, onStart }: Props) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-8">
      <h1 className="flex items-center gap-2 text-[20px] font-bold tracking-tight text-neutral-950">
        {icon}
        {title}
      </h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onStartFree}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-[13px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
        >
          Start Free Session
        </button>
        <button
          onClick={onStart}
          className="rounded-lg bg-neutral-950 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-neutral-800"
        >
          Start Session
        </button>
      </div>
    </header>
  );
}
