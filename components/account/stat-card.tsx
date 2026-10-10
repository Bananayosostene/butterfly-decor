import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** One dashboard number: label, big value, an icon chip and a soft circle in the corner. */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <span
        aria-hidden
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full transition-transform duration-500 group-hover:scale-125"
        style={{ background: "color-mix(in srgb, var(--dash-accent) 12%, transparent)" }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "color-mix(in srgb, var(--dash-accent) 16%, transparent)", color: "var(--dash-accent)" }}
        >
          <Icon className="w-5 h-5" />
        </span>
      </div>
    </>
  );

  const className =
    "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg";

  return href ? (
    <Link href={href} className={`block ${className}`}>{body}</Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
