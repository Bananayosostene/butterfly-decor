import { Radio } from "lucide-react";
import { prisma } from "@/lib/db";
import { realVisits } from "@/lib/visits";

const DAYS = 30;
/** Visits looked at for the lists below (the newest ones in the period). */
const SAMPLE = 5000;

const top = (values: (string | null | undefined)[], take = 6) => {
  const counts = new Map<string, number>();
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, take);
};

/** "instagram.com" from "https://l.instagram.com/…" */
const site = (url: string | null) => {
  if (!url) return "Direct (typed or saved link)";
  try {
    return new URL(url).hostname.replace(/^(www|l|m|lm)\./, "");
  } catch {
    return url.slice(0, 40);
  }
};

/** Who is on the site now, new against returning visitors, and the top pages, sources and countries. */
export async function VisitorInsights() {
  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);
  const [online, visits] = await Promise.all([
    prisma.deviceVisit.findMany({
      where: realVisits({ lastSeenAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } }),
      orderBy: { lastSeenAt: "desc" },
      take: 10,
      select: { id: true, userName: true, city: true, country: true, device: true, pages: true, landingPage: true },
    }),
    prisma.deviceVisit.findMany({
      where: realVisits({ createdAt: { gte: since } }),
      orderBy: { createdAt: "desc" },
      take: SAMPLE,
      select: { pages: true, landingPage: true, referrer: true, country: true, returning: true },
    }),
  ]);

  const returning = visits.filter((v) => v.returning).length;
  const lists = [
    { title: "Most opened pages", rows: top(visits.flatMap((v) => (v.pages.length ? v.pages : [v.landingPage?.split("?")[0]]))) },
    { title: "Where they came from", rows: top(visits.map((v) => site(v.referrer))) },
    { title: "Countries", rows: top(visits.map((v) => v.country ?? "Unknown")) },
  ];
  const panel = "bg-card border border-border rounded-2xl p-5";

  return (
    <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className={panel}>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Radio className="w-4 h-4" style={{ color: online.length ? "var(--dash-ok)" : "var(--muted-foreground)" }} />
          On the site now · {online.length}
        </h2>
        {online.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nobody in the last 5 minutes.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {online.map((v) => (
              <li key={v.id} className="text-sm">
                <p className="text-foreground truncate">{v.userName ?? "Guest"} · {[v.city, v.country].filter(Boolean).join(", ") || "Unknown"}</p>
                <p className="text-xs text-muted-foreground truncate">{v.device} · on {v.pages.at(-1) ?? v.landingPage ?? "/"}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Last {DAYS} days</p>
          <p className="text-sm text-foreground">
            <span className="font-semibold">{visits.length - returning}</span> new · <span className="font-semibold">{returning}</span> came back
          </p>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${visits.length ? (returning / visits.length) * 100 : 0}%`, background: "var(--dash-accent)" }} />
          </div>
        </div>
      </div>
      {lists.map((list) => {
        const max = Math.max(1, ...list.rows.map(([, n]) => n));
        return (
          <div key={list.title} className={panel}>
            <h2 className="text-sm font-semibold text-foreground">{list.title}</h2>
            <p className="text-xs text-muted-foreground mb-3">Last {DAYS} days</p>
            {list.rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-2">
                {list.rows.map(([label, n]) => (
                  <li key={label}>
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="text-foreground truncate" title={label}>{label}</span>
                      <span className="text-muted-foreground shrink-0">{n}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(n / max) * 100}%`, background: "var(--dash-accent)" }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
