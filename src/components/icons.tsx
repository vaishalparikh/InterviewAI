type IconProps = {
  size?: number;
  className?: string;
  stroke?: number;
};

const base = (stroke = 1.6) => ({
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: stroke,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
});

export function ArrowRight({ size = 14, className, stroke = 2.4 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export function ArrowDown({ size = 14, className, stroke = 2.4 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}

export function Sparkle({ size = 14, className, stroke = 2.4 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />
      <path d="M19 4v3M21 5.5h-3" />
    </svg>
  );
}

export function Wave({ size = 18, className, stroke = 1.8 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <path d="M2 12h2M22 12h-2M6 8v8M10 5v14M14 5v14M18 8v8" />
    </svg>
  );
}

export function Globe({ size = 18, className, stroke = 1.8 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export function Lightbulb({ size = 18, className, stroke = 1.8 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.5.5 1 1.3 1 2.3v1h6v-1c0-1 .5-1.8 1-2.3A7 7 0 0 0 12 2z" />
    </svg>
  );
}

export function Target({ size = 18, className, stroke = 1.8 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

export function User({ size = 18, className, stroke = 1.8 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function Check({ size = 14, className, stroke = 2.4 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export function Play({ size = 12, className, stroke = 2.6 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <path d="m6 4 14 8-14 8z" />
    </svg>
  );
}

export function Pin({ size = 13, className, stroke = 2 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <path d="m12 2 3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" />
    </svg>
  );
}

export function Refresh({ size = 13, className, stroke = 2 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export function Minimize({ size = 13, className, stroke = 2 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function Bookmark({ size = 11, className, stroke = 2 }: IconProps) {
  return (
    <svg {...base(stroke)} width={size} height={size} className={className}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function Star({ size = 14, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
      <path d="M12 2l2.9 6.4 7.1.8-5.4 4.8 1.6 7-6.2-3.6L5.8 21l1.6-7L2 9.2l7.1-.8z" />
    </svg>
  );
}

export function Waveform({ bars = 8, className }: { bars?: number; className?: string }) {
  return (
    <span className={`iv-wave ${className ?? ""}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="bar"
          style={{
            animationDelay: `${(i * 0.07) % 1.2}s`,
            animationDuration: `${0.9 + (i % 3) * 0.2}s`,
          }}
        />
      ))}
    </span>
  );
}
