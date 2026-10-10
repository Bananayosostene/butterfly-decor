import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BookOpen, CalendarDays, Clock, FolderOpen, Images, Shirt, Sun, Users } from "lucide-react";
import { StatCard } from "@/components/account/stat-card";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [
    totalCategories, totalItems, totalStyleIdeas,
    totalBookings, newBookings,
    visitorsToday, visitorsThisMonth, visitorsThisHour, totalVisitors,
    recentBookings,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.collectionItem.count(),
    prisma.styleIdea.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "NEW" } }),
    prisma.deviceVisit.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.deviceVisit.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.deviceVisit.count({ where: { createdAt: { gte: oneHourAgo } } }),
    prisma.deviceVisit.count(),
    prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    { label: "Categories", value: totalCategories, href: "/account/categories", icon: FolderOpen },
    { label: "Collection Items", value: totalItems, href: "/account/collection-items", icon: Images },
    { label: "Style Ideas", value: totalStyleIdeas, href: "/account/style-ideas", icon: Shirt },
    { label: "Total Bookings", value: totalBookings, href: "/account/bookings", icon: BookOpen },
  ];

  const visitorStats = [
    { label: "This Hour", value: visitorsThisHour, icon: Clock },
    { label: "Today", value: visitorsToday, icon: Sun },
    { label: "This Month", value: visitorsThisMonth, icon: CalendarDays },
    { label: "All Time", value: totalVisitors, icon: Users },
  ];

  return (
    <div className="space-y-8">
      {/* Content Stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Content</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} href={s.href} />
          ))}
        </div>
      </div>

      {/* Visitor Stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Visitors</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {visitorStats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
          ))}
        </div>
      </div>

      {/* New Bookings Alert */}
      {newBookings > 0 && (
        <div className="p-4 rounded-2xl border flex items-center justify-between" style={{ background: "var(--dash-soft)", borderColor: "var(--border)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            You have <strong>{newBookings}</strong> new booking{newBookings > 1 ? "s" : ""} waiting for review.
          </p>
          <Link href="/account/bookings" className="text-xs font-semibold px-4 py-2 rounded-full" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            View
          </Link>
        </div>
      )}

      {/* Recent Bookings */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Recent Bookings</h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {recentBookings.length === 0 ? (
            <p className="p-6 text-muted-foreground text-sm">No bookings yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Phone</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Event Date</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-t border-border">
                    <td className="px-4 py-3 text-foreground">{b.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(b.eventDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: b.status === "NEW" ? "var(--dash-soft)" : "var(--dash-ok-bg)", color: b.status === "NEW" ? "var(--dash-accent)" : "var(--dash-ok)" }}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/account/bookings/${b.id}`} className="text-xs font-medium" style={{ color: "var(--dash-accent)" }}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
