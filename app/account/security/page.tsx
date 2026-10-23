import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/db";

const kigali = (date: Date) => date.toLocaleString("en-GB", { timeZone: "Africa/Kigali", dateStyle: "medium", timeStyle: "short" });

/** Every sign-in attempt (admin, vendors and clients), newest first: who, how, from where, and whether it worked. */
export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const [{ show }, cookieStore] = await Promise.all([searchParams, cookies()]);
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const filter = show === "failed" ? { success: false } : show === "admin" ? { who: "ADMIN" } : {};
  const [events, failedWeek] = await Promise.all([
    prisma.loginEvent.findMany({ where: filter, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.loginEvent.count({ where: { success: false, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
  ]);

  const tabs = [
    { key: "", label: "All sign-ins" },
    { key: "admin", label: "Admin only" },
    { key: "failed", label: "Failed attempts" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/account/security?show=${t.key}` : "/account/security"}
            className="px-4 py-1.5 rounded-full text-sm font-medium border border-border"
            style={(show ?? "") === t.key ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--foreground)" }}
          >
            {t.label}
          </Link>
        ))}
        <p className="text-xs text-muted-foreground">{failedWeek} failed attempt{failedWeek === 1 ? "" : "s"} in the last 7 days.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["When (Kigali)", "Account", "Method", "Result", "Device", "Place / IP"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">{kigali(e.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{e.email}</p>
                    <p className="text-xs text-muted-foreground">{e.who === "ADMIN" ? "Admin" : "Site account"}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.method === "GOOGLE" ? "Google" : "Password"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={e.success ? { background: "var(--dash-ok-bg)", color: "var(--dash-ok)" } : { background: "var(--dash-danger-bg)", color: "var(--dash-danger)" }}>
                      {e.success ? "Signed in" : "Failed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.device ?? "-"}</td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{[e.city, e.country].filter(Boolean).join(", ") || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{e.ip ?? "-"}</p>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No sign-ins recorded yet. They appear here from now on.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
