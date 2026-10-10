import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { BookOpen, CalendarDays, FolderOpen, Users } from "lucide-react";
import { StatBarChart, StatTrendChart } from "@/components/account/stat-bar-chart";
import { StatCard } from "@/components/account/stat-card";

// Validated categorical palette (fixed order — identity encoding, e.g. device/browser breakdowns).
const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"];
// Single-hue magnitude color (bookings trend, category item counts).
// Follows the dashboard theme, so it stays readable in dark and light mode.
const GOLD = "var(--dash-accent)";

const DEVICES = ["Desktop", "Mobile", "Tablet"] as const;
const BROWSERS = ["Chrome", "Firefox", "Safari", "Edge", "Unknown"] as const;

export default async function StatisticsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const now = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (13 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const dayRanges = days.map((d) => ({ start: d, end: new Date(d.getTime() + 24 * 60 * 60 * 1000) }));

  const [bookingCounts, deviceCounts, browserCounts, categories, totalVisitorsAll, totalBookingsAll] = await Promise.all([
    Promise.all(dayRanges.map((r) => prisma.booking.count({ where: { createdAt: { gte: r.start, lt: r.end } } }))),
    Promise.all(DEVICES.map((d) => prisma.deviceVisit.count({ where: { device: d } }))),
    Promise.all(BROWSERS.map((b) => prisma.deviceVisit.count({ where: { browser: b } }))),
    prisma.category.findMany({ include: { _count: { select: { items: true } } } }),
    prisma.deviceVisit.count(),
    prisma.booking.count(),
  ]);

  const trendPoints = days.map((d, i) => ({
    label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    value: bookingCounts[i],
  }));

  const deviceBars = DEVICES.map((label, i) => ({ label, value: deviceCounts[i], color: CATEGORICAL[i] }));
  const browserBars = BROWSERS.map((label, i) => ({ label, value: browserCounts[i], color: CATEGORICAL[i % CATEGORICAL.length] }));

  const topCategories = [...categories]
    .sort((a, b) => b._count.items - a._count.items)
    .slice(0, 8)
    .map((c) => ({ label: c.name, value: c._count.items, color: GOLD }));

  const bookingsLast14 = bookingCounts.reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Bookings (14d)" value={bookingsLast14} icon={CalendarDays} />
        <StatCard label="All-Time Bookings" value={totalBookingsAll} icon={BookOpen} />
        <StatCard label="All-Time Visitors" value={totalVisitorsAll} icon={Users} />
        <StatCard label="Categories" value={categories.length} icon={FolderOpen} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Bookings — Last 14 Days</h2>
        <StatTrendChart points={trendPoints} color={GOLD} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Visitors by Device</h2>
            <Link href="/account/visitors" className="text-xs font-medium" style={{ color: "var(--dash-accent)" }}>See every visitor</Link>
          </div>
          <StatBarChart bars={deviceBars} />
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Visitors by Browser</h2>
          <StatBarChart bars={browserBars} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Top Categories by Item Count</h2>
        <StatBarChart bars={topCategories} unit=" items" />
      </div>
    </div>
  );
}
