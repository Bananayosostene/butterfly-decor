import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) redirect("/admin/login");

  const adminUser = await prisma.adminUser.findFirst();
  if (!adminUser) redirect("/admin/login");

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [totalBookings, newBookings, confirmedBookings, upcomingEvents,
    totalVisitors, visitorsToday, visitorsThisMonth, visitorsThisHour, recentVisitors] =
    await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "NEW" } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.findMany({
        where: { eventDate: { gte: new Date() } },
        orderBy: { eventDate: "asc" },
        take: 5,
      }),
      prisma.deviceVisit.count(),
      prisma.deviceVisit.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.deviceVisit.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.deviceVisit.count({ where: { createdAt: { gte: oneHourAgo } } }),
      prisma.deviceVisit.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Butterfly Events Admin</h1>
          <form action={async () => { "use server"; (await cookies()).delete("admin_session"); redirect("/admin/login"); }}>
            <button type="submit" className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-smooth text-sm font-medium">Logout</button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Booking Stats */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Bookings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Total Bookings</p>
            <p className="text-4xl font-bold text-foreground">{totalBookings}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">New Bookings</p>
            <p className="text-4xl font-bold text-foreground">{newBookings}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Confirmed</p>
            <p className="text-4xl font-bold text-green-600">{confirmedBookings}</p>
          </div>
        </div>

        {/* Visitor Stats */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Visitors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="p-6 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">This Hour</p>
            <p className="text-4xl font-bold text-foreground">{visitorsThisHour}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Today</p>
            <p className="text-4xl font-bold text-foreground">{visitorsToday}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">This Month</p>
            <p className="text-4xl font-bold text-foreground">{visitorsThisMonth}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">All Time</p>
            <p className="text-4xl font-bold text-foreground">{totalVisitors}</p>
          </div>
        </div>

        {/* Recent Visitors */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Visitors</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-10">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-muted-foreground">Device</th>
                <th className="text-left px-4 py-3 text-muted-foreground">Browser</th>
                <th className="text-left px-4 py-3 text-muted-foreground">OS</th>
                <th className="text-left px-4 py-3 text-muted-foreground">IP</th>
                <th className="text-left px-4 py-3 text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentVisitors.map((v) => (
                <tr key={v.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">{v.device}</td>
                  <td className="px-4 py-3 text-foreground">{v.browser}</td>
                  <td className="px-4 py-3 text-foreground">{v.os}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.ip}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link href="/admin/requests" className="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-smooth">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-semibold text-foreground mb-1">Manage Bookings</h3>
            <p className="text-sm text-muted-foreground">View and update booking statuses</p>
          </Link>
          <Link href="/admin/events" className="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-smooth">
            <div className="text-3xl mb-2">🖼️</div>
            <h3 className="font-semibold text-foreground mb-1">Manage Portfolio</h3>
            <p className="text-sm text-muted-foreground">Upload and manage gallery images</p>
          </Link>
          <Link href="/admin/settings" className="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-smooth">
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="font-semibold text-foreground mb-1">Settings</h3>
            <p className="text-sm text-muted-foreground">Manage admin account</p>
          </Link>
        </div>

        {/* Upcoming Events */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-muted-foreground">No upcoming events</p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <Link key={event.id} href={`/admin/requests/${event.id}`}
                className="p-4 bg-card border border-border rounded-lg hover:shadow-lg transition-smooth block">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">{event.eventType} • {new Date(event.eventDate).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">{event.phone}</p>
                  </div>
                  <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">{event.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
