import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** A string of fairy lights across the top of a card: a small nod to the decor business. */
function FairyLights() {
  const bulbs = Array.from({ length: 9 }, (_, i) => {
    const x = 12 + i * 34;
    const y = 10 + Math.sin((i / 8) * Math.PI) * 10;
    return { x, y };
  });
  return (
    <svg aria-hidden viewBox="0 0 296 34" className="absolute inset-x-0 top-0 w-full h-8 pointer-events-none" preserveAspectRatio="none">
      <path d="M0 8 Q148 34 296 8" fill="none" stroke="var(--border)" strokeWidth="1.2" />
      {bulbs.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y + 3} r={2.6} fill="var(--dash-accent)" opacity={i % 2 ? 0.45 : 0.9}>
          <animate attributeName="opacity" values={i % 2 ? "0.45;0.9;0.45" : "0.9;0.4;0.9"} dur={`${2.4 + (i % 3) * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

export type InsightLine = { label: string; value: number | string; tone?: "accent" | "ok" | "warn" };

/** One dashboard card: a headline number and the few figures that explain it. */
export function InsightCard({
  title,
  value,
  caption,
  icon: Icon,
  lines,
  href,
}: {
  title: string;
  value: number | string;
  caption: string;
  icon: LucideIcon;
  lines: InsightLine[];
  href?: string;
}) {
  const toneColor = (tone?: InsightLine["tone"]) =>
    tone === "ok" ? "var(--dash-ok)" : tone === "warn" ? "var(--dash-danger)" : tone === "accent" ? "var(--dash-accent)" : "var(--foreground)";
  const body = (
    <>
      <FairyLights />
      <div className="relative flex items-start justify-between gap-3 pt-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{caption}</p>
        </div>
        <span className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--dash-accent) 15%, transparent)", color: "var(--dash-accent)" }}>
          <Icon className="w-5 h-5" />
        </span>
      </div>
      <dl className="relative mt-4 pt-3 border-t border-border grid grid-cols-2 gap-x-3 gap-y-2">
        {lines.map((line) => (
          <div key={line.label} className="min-w-0">
            <dt className="text-[11px] text-muted-foreground truncate">{line.label}</dt>
            <dd className="text-sm font-semibold" style={{ color: toneColor(line.tone) }}>{line.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
  const className = "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg";
  return href ? <Link href={href} className={`block ${className}`}>{body}</Link> : <div className={className}>{body}</div>;
}
