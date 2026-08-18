type Bar = { label: string; value: number; color: string };

/** A simple horizontal magnitude/categorical bar chart with direct labels (no color-only encoding). */
export function StatBarChart({ bars, unit }: { bars: Bar[]; unit?: string }) {
  const max = Math.max(1, ...bars.map((b) => b.value));

  if (bars.every((b) => b.value === 0)) {
    return <p className="text-sm text-muted-foreground py-6 text-center">No data yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="text-xs text-foreground w-24 shrink-0 truncate" title={b.label}>{b.label}</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, (b.value / max) * 100)}%`, background: b.color }}
            />
          </div>
          <span className="text-xs font-semibold text-foreground w-10 shrink-0 text-right">
            {b.value}{unit ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}

/** A vertical bar chart for time-series (e.g. bookings per day). */
export function StatTrendChart({ points, color }: { points: { label: string; value: number }[]; color: string }) {
  const max = Math.max(1, ...points.map((p) => p.value));

  return (
    <div className="flex items-end gap-1.5" style={{ height: 120 }}>
      {points.map((p, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
          <div className="w-full flex items-end" style={{ height: 90 }}>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{ height: `${Math.max(3, (p.value / max) * 100)}%`, background: color, minHeight: p.value > 0 ? 4 : 2 }}
              title={`${p.label}: ${p.value}`}
            />
          </div>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{p.label}</span>
          <span className="absolute -top-4 text-[10px] font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
