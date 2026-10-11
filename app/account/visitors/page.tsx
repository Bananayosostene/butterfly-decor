import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { Clock, Eye, Globe, Heart, MessageCircle, Users } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parsePage } from "@/lib/data";
import { StatCard } from "@/components/account/stat-card";
import { OWNER_VISITS, realVisits } from "@/lib/visits";

const PER_PAGE = 50;

/** "3m 12s", "45s", "1h 4m" */
function duration(seconds: number | null) {
  if (seconds === null) return "-";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}m ${seconds % 60}s` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

const kigali = (date: Date) =>
  date.toLocaleString("en-GB", { timeZone: "Africa/Kigali", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(" ");

/**
 * Every visit with everything known about it, newest first. Real visitors by default; the site
 * owner's own visits (`?view=mine`) are kept on a separate tab and out of the numbers.
 */
export default async function VisitorsPage({ searchParams }: { searchParams: Promise<{ page?: string; view?: string }> }) {
  const [{ page: rawPage, view }, cookieStore] = await Promise.all([searchParams, cookies()]);
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const page = parsePage(rawPage);
  const mine = view === "mine";
  const scope = (extra: Prisma.DeviceVisitWhereInput = {}) => (mine ? { ...OWNER_VISITS, ...extra } : realVisits(extra));
  const href = (nextPage: number, nextMine = mine) => {
    const params = new URLSearchParams({ ...(nextMine && { view: "mine" }), ...(nextPage > 1 && { page: String(nextPage) }) });
    const query = params.toString();
    return query ? `/account/visitors?${query}` : "/account/visitors";
  };
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [visits, total, today, timed, countries, mineCount, realCount] = await Promise.all([
    prisma.deviceVisit.findMany({ where: scope(), orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    prisma.deviceVisit.count({ where: scope() }),
    prisma.deviceVisit.count({ where: scope({ createdAt: { gte: startOfDay } }) }),
    prisma.deviceVisit.aggregate({ where: scope({ durationSeconds: { gt: 0 } }), _avg: { durationSeconds: true } }),
    prisma.deviceVisit.findMany({ where: scope({ country: { not: null } }), distinct: ["country"], select: { country: true } }),
    prisma.deviceVisit.count({ where: OWNER_VISITS }),
    prisma.deviceVisit.count({ where: realVisits() }),
  ]);

  // Likes and comments made from the browsers on this page.
  const visitorIds = [...new Set(visits.map((v) => v.visitorId).filter((id): id is string => !!id))];
  const [likes, comments] = visitorIds.length
    ? await Promise.all([
        prisma.itemLike.groupBy({ by: ["visitorId"], where: { visitorId: { in: visitorIds } }, _count: { visitorId: true } }),
        prisma.itemComment.groupBy({ by: ["visitorId"], where: { visitorId: { in: visitorIds } }, _count: { visitorId: true } }),
      ])
    : [[], []];
  const likesOf = new Map(likes.map((l) => [l.visitorId, l._count.visitorId]));
  const commentsOf = new Map(comments.map((c) => [c.visitorId, c._count.visitorId]));
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 border border-border rounded-lg p-1 w-fit">
          {[
            { label: `Visitors (${realCount})`, active: !mine, to: href(1, false) },
            { label: `My own visits (${mineCount})`, active: mine, to: href(1, true) },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.to}
              className="px-4 py-1.5 text-sm rounded-md font-medium"
              style={tab.active ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {mine ? "Your own visits: recorded, but not counted in any visitor number." : "Your own visits are not counted here."}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={mine ? "My visits" : "All visits"} value={total} icon={Users} />
        <StatCard label="Today" value={today} icon={Eye} />
        <StatCard label="Average time" value={duration(Math.round(timed._avg.durationSeconds ?? 0))} icon={Clock} />
        <StatCard label="Countries" value={countries.length} icon={Globe} />
      </div>

      {visits.length === 0 ? (
        <p className="text-muted-foreground text-sm">No visits recorded yet.</p>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {["Visited (Kigali time)", "Visitor", "Location / IP", "Device", "Browser / System", "Came from", "Pages opened", "Time on site", "Reactions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => {
                  const place = [v.city, v.region, v.country].filter(Boolean).join(", ");
                  return (
                    <tr key={v.id} className="border-t border-border align-top hover:bg-muted/40">
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{kigali(v.createdAt)}</td>
                      <td className="px-4 py-3">
                        {v.userName ? (
                          <>
                            <p className="text-foreground font-medium">{v.userName}</p>
                            {v.userEmail && <p className="text-xs text-muted-foreground">{v.userEmail}</p>}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Guest</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{place || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{v.ip ?? "-"}</p>
                        {v.timezone && <p className="text-xs text-muted-foreground">{v.timezone}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{join(v.device, v.model && `· ${v.model}`) || "-"}</p>
                        <p className="text-xs text-muted-foreground">{join(v.screen && `Screen ${v.screen}`, v.connection && `· ${v.connection}`)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground whitespace-nowrap">{join(v.browser, v.browserVersion) || "-"}</p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{join(v.os, v.osVersion, v.language && `· ${v.language}`)}</p>
                        {/* The raw text the browser sent, for anything not shown above */}
                        <details className="mt-1 text-xs text-muted-foreground">
                          <summary className="cursor-pointer">Full details</summary>
                          <p className="mt-1 max-w-xs break-words">{v.userAgent}</p>
                        </details>
                      </td>
                      <td className="px-4 py-3 max-w-[14rem]">
                        <p className="text-foreground truncate" title={v.referrer ?? undefined}>{v.referrer ? v.referrer.replace(/^https?:\/\//, "") : "Direct"}</p>
                        {v.landingPage && <p className="text-xs text-muted-foreground truncate" title={v.landingPage}>Opened {v.landingPage}</p>}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {v.pageViews ?? "-"}
                        {v.pages.length > 0 && (
                          <ol className="mt-1 space-y-0.5 text-xs text-muted-foreground list-decimal list-inside max-w-[14rem]">
                            {v.pages.map((path) => (
                              <li key={path} className="truncate" title={path}>{path}</li>
                            ))}
                          </ol>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap">{duration(v.durationSeconds)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {v.visitorId && (likesOf.get(v.visitorId) || commentsOf.get(v.visitorId)) ? (
                          <span className="inline-flex items-center gap-3 text-foreground">
                            <span className="inline-flex items-center gap-1" title="Likes"><Heart className="w-3.5 h-3.5" /> {likesOf.get(v.visitorId) ?? 0}</span>
                            <span className="inline-flex items-center gap-1" title="Comments"><MessageCircle className="w-3.5 h-3.5" /> {commentsOf.get(v.visitorId) ?? 0}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Page {page} of {lastPage}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={href(page - 1)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent">Newer</Link>
            )}
            {page < lastPage && (
              <Link href={href(page + 1)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent">Older</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
