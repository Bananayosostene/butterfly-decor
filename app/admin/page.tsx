import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/admin/login");

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
    { label: "Categories", value: totalCategories, href: "/admin/categories", color: "#3d230c" },
    { label: "Collection Items", value: totalItems, href: "/admin/collection-items", color: "#2b1807" },
    { label: "Style Ideas", value: totalStyleIdeas, href: "/admin/style-ideas", color: "#57422C" },
    { label: "Total Bookings", value: totalBookings, href: "/admin/bookings", color: "#835105" },
  ];

  const visitorStats = [
    { label: "This Hour", value: visitorsThisHour },
    { label: "Today", value: visitorsToday },
    { label: "This Month", value: visitorsThisMonth },
    { label: "All Time", value: totalVisitors },
  ];

  return (
    <div className="space-y-8">
      {/* Content Stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Content</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="p-5 bg-card border border-border rounded-xl hover:shadow-md transition-shadow">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Visitor Stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Visitors</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {visitorStats.map((s) => (
            <div key={s.label} className="p-5 bg-card border border-border rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* New Bookings Alert */}
      {newBookings > 0 && (
        <div className="p-4 rounded-xl border flex items-center justify-between" style={{ background: "#fdf6ee", borderColor: "#57422C" }}>
          <p className="text-sm font-medium" style={{ color: "#2b1807" }}>
            You have <strong>{newBookings}</strong> new booking{newBookings > 1 ? "s" : ""} waiting for review.
          </p>
          <Link href="/admin/bookings" className="text-xs font-semibold px-4 py-2 rounded-full" style={{ background: "#2b1807", color: "#e8d5b7" }}>
            View
          </Link>
        </div>
      )}

      {/* Recent Bookings */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Recent Bookings</h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
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
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: b.status === "NEW" ? "#fdf6ee" : "#f0fdf4", color: b.status === "NEW" ? "#835105" : "#166534" }}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/bookings/${b.id}`} className="text-xs font-medium" style={{ color: "#3d230c" }}>View</Link>
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
