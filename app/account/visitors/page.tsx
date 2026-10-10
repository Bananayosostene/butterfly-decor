import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { Clock, Eye, Globe, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { parsePage } from "@/lib/data";
import { StatCard } from "@/components/account/stat-card";

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

/** Every visit with everything known about it, newest first. */
export default async function VisitorsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const [{ page: rawPage }, cookieStore] = await Promise.all([searchParams, cookies()]);
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const page = parsePage(rawPage);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [visits, total, today, timed, countries] = await Promise.all([
    prisma.deviceVisit.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    prisma.deviceVisit.count(),
    prisma.deviceVisit.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.deviceVisit.aggregate({ where: { durationSeconds: { gt: 0 } }, _avg: { durationSeconds: true } }),
    prisma.deviceVisit.findMany({ where: { country: { not: null } }, distinct: ["country"], select: { country: true } }),
  ]);
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="All visits" value={total} icon={Users} />
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
                  {["Visited (Kigali time)", "Visitor", "Location / IP", "Device", "Browser / System", "Came from", "Pages", "Time on site"].map((h) => (
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
                      <td className="px-4 py-3 text-foreground">{v.pageViews ?? "-"}</td>
                      <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap">{duration(v.durationSeconds)}</td>
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
              <Link href={`/account/visitors?page=${page - 1}`} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent">Newer</Link>
            )}
            {page < lastPage && (
              <Link href={`/account/visitors?page=${page + 1}`} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent">Older</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
