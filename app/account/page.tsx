import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight, CalendarHeart, Gem, Sparkles, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { kindOf } from "@/lib/category-icons";
import { BOOKING_STATUSES, statusLabel, untilEvent } from "@/lib/bookings";
import { realVisits } from "@/lib/visits";
import { InsightCard } from "@/components/account/insight-card";
import { ActivityChart, DeviceChart, StatusChart, StockChart } from "@/components/account/dashboard-charts";
import { BookingCard, bookingThumbs } from "@/components/account/booking-card";

const DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

const panel = "bg-card border border-border rounded-2xl p-5";
const fmt = (n: number) => n.toLocaleString("en-US");

/** "3m 12s" */
const duration = (seconds: number) => (seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`);

/** The admin's overview: four summary cards, activity charts, upcoming events and newest bookings. */
export default async function AdminDashboard() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const since = new Date(startOfDay.getTime() - (DAYS - 1) * DAY);
  const inTwoWeeks = new Date(startOfDay.getTime() + 15 * DAY);

  const [
    bookingStatus, bookingsThisMonth, recentBookings, upcoming, bookingDays,
    visitsToday, visitsMonth, visitsAll, onlineNow, returningMonth, avgTime, visitDays, devices,
    categories, itemsPerCategory, albums, vendorPhotos, imageViews,
    clients, vendors, pendingVendors, likes, comments, planningSent, inquiries,
  ] = await Promise.all([
    prisma.booking.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, phone: true, eventDate: true, status: true, selectedItems: true, createdAt: true } }),
    prisma.booking.findMany({
      where: { eventDate: { gte: startOfDay, lt: inTwoWeeks }, status: { not: "CANCELLED" } },
      orderBy: { eventDate: "asc" },
      take: 5,
      select: { id: true, name: true, phone: true, eventDate: true, selectedItems: true },
    }),
    prisma.booking.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.deviceVisit.count({ where: realVisits({ createdAt: { gte: startOfDay } }) }),
    prisma.deviceVisit.count({ where: realVisits({ createdAt: { gte: startOfMonth } }) }),
    prisma.deviceVisit.count({ where: realVisits() }),
    prisma.deviceVisit.count({ where: realVisits({ lastSeenAt: { gte: new Date(now.getTime() - 5 * 60 * 1000) } }) }),
    prisma.deviceVisit.count({ where: realVisits({ createdAt: { gte: startOfMonth }, returning: true }) }),
    prisma.deviceVisit.aggregate({ where: realVisits({ createdAt: { gte: startOfMonth }, durationSeconds: { gt: 0 } }), _avg: { durationSeconds: true } }),
    prisma.deviceVisit.findMany({ where: realVisits({ createdAt: { gte: since } }), select: { createdAt: true } }),
    prisma.deviceVisit.groupBy({ by: ["device"], where: realVisits({ createdAt: { gte: startOfMonth } }), _count: { device: true } }),
    prisma.category.findMany({ select: { id: true, name: true, kind: true } }),
    prisma.collectionItem.groupBy({ by: ["categoryId"], _count: { categoryId: true } }),
    prisma.weddingAlbum.count(),
    prisma.vendorItem.count({ where: { active: true } }),
    prisma.imageView.count(),
    prisma.user.count({ where: { OR: [{ role: "CLIENT" }, { role: null }, { role: { isSet: false } }] } }),
    prisma.user.count({ where: { role: "VENDOR" } }),
    prisma.user.count({ where: { role: "VENDOR", vendorStatus: "PENDING" } }),
    prisma.itemLike.count(),
    prisma.itemComment.count(),
    prisma.planningSheet.count({ where: { submittedAt: { not: null } } }),
    prisma.inquiry.count({ where: { createdAt: { gte: startOfMonth } } }),
  ]);

  // ── Bookings ──
  const countOf = (s: string) => bookingStatus.find((b) => b.status === s)?._count.status ?? 0;
  const totalBookings = bookingStatus.reduce((n, b) => n + b._count.status, 0);
  const statusData = BOOKING_STATUSES.map((s) => ({ status: s, label: statusLabel[s], count: countOf(s) })).filter((d) => d.count > 0);

  // ── Daily activity ──
  const dayKey = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const perDay = (dates: { createdAt: Date }[]) => {
    const counts = new Map<number, number>();
    for (const { createdAt } of dates) counts.set(dayKey(createdAt), (counts.get(dayKey(createdAt)) ?? 0) + 1);
    return counts;
  };
  const visitsPerDay = perDay(visitDays);
  const bookingsPerDay = perDay(bookingDays);
  const activity = Array.from({ length: DAYS }, (_, i) => {
    const day = new Date(since.getTime() + i * DAY);
    const key = dayKey(day);
    return { day: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), visitors: visitsPerDay.get(key) ?? 0, bookings: bookingsPerDay.get(key) ?? 0 };
  });

  // ── Stock ──
  const countByCategory = new Map(itemsPerCategory.map((g) => [g.categoryId, g._count.categoryId]));
  const stock = categories
    .map((c) => ({ name: c.name.trim(), items: countByCategory.get(c.id) ?? 0, decor: kindOf(c) === "DECOR" }))
    .filter((c) => c.items > 0)
    .sort((a, b) => b.items - a.items);
  const outfits = stock.filter((c) => !c.decor).reduce((n, c) => n + c.items, 0);
  const decor = stock.filter((c) => c.decor).reduce((n, c) => n + c.items, 0);

  const thumbs = await bookingThumbs(recentBookings);

  return (
    <div className="space-y-6">
      {/* Four cards, each summing up one side of the business */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <InsightCard
          title="Bookings"
          value={fmt(totalBookings)}
          caption={`${fmt(bookingsThisMonth)} this month`}
          icon={CalendarHeart}
          href="/account/bookings"
          lines={[
            { label: "Waiting for you", value: countOf("NEW"), tone: countOf("NEW") ? "warn" : undefined },
            { label: "Confirmed", value: countOf("CONFIRMED"), tone: "ok" },
            { label: "Events in 2 weeks", value: upcoming.length, tone: "accent" },
            { label: "Planning lists", value: planningSent },
          ]}
        />
        <InsightCard
          title="Visitors"
          value={fmt(visitsMonth)}
          caption="this month"
          icon={Users}
          href="/account/visitors"
          lines={[
            { label: "On the site now", value: onlineNow, tone: onlineNow ? "ok" : undefined },
            { label: "Today", value: visitsToday },
            { label: "Came back this month", value: returningMonth, tone: "accent" },
            { label: "Average time", value: duration(Math.round(avgTime._avg.durationSeconds ?? 0)) },
          ]}
        />
        <InsightCard
          title="In stock"
          value={fmt(outfits + decor)}
          caption="pieces in the collection"
          icon={Gem}
          href="/account/collection-items"
          lines={[
            { label: "Outfits", value: fmt(outfits) },
            { label: "Decor", value: fmt(decor) },
            { label: "Wedding albums", value: albums },
            { label: "Image views", value: fmt(imageViews), tone: "accent" },
          ]}
        />
        <InsightCard
          title="Community"
          value={fmt(clients + vendors)}
          caption={`${fmt(clients)} clients · ${fmt(vendors)} vendors`}
          icon={Sparkles}
          href="/account/users"
          lines={[
            { label: "Vendors to approve", value: pendingVendors, tone: pendingVendors ? "warn" : undefined },
            { label: "Vendor leads this month", value: inquiries, tone: "accent" },
            { label: "Likes", value: fmt(likes) },
            { label: "Comments", value: fmt(comments) },
          ]}
        />
      </div>

      {/* Activity */}
      <div className="grid xl:grid-cols-[1fr_320px] gap-6">
        <div className={panel}>
          <h2 className="text-sm font-semibold text-foreground">Last {DAYS} days</h2>
          <p className="text-xs text-muted-foreground mb-3">Real visitors and bookings per day (your own visits are left out).</p>
          <ActivityChart data={activity} />
        </div>
        <div className={panel}>
          <h2 className="text-sm font-semibold text-foreground">Bookings by status</h2>
          {statusData.length ? <StatusChart data={statusData} /> : <p className="py-16 text-center text-sm text-muted-foreground">No bookings yet.</p>}
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_320px] gap-6">
        <div className={panel}>
          <h2 className="text-sm font-semibold text-foreground">What is in stock</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Pieces per category: <span style={{ color: "#c8963e" }}>outfits</span> and <span style={{ color: "#6f9478" }}>decor</span>. {vendorPhotos} vendor photos are shown besides.
          </p>
          <StockChart data={stock} />
        </div>
        <div className={panel}>
          <h2 className="text-sm font-semibold text-foreground">Devices this month</h2>
          {devices.length ? (
            <DeviceChart data={devices.map((d) => ({ device: d.device ?? "Unknown", count: d._count.device }))} />
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">No visits this month yet.</p>
          )}
        </div>
      </div>

      {/* Bookings */}
      <div className="grid xl:grid-cols-[1fr_380px] gap-6 items-start">
        <div className={panel}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Newest bookings</h2>
            <Link href="/account/bookings" className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--dash-accent)" }}>
              All bookings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="space-y-3">{recentBookings.map((b) => <BookingCard key={b.id} booking={b} thumbs={thumbs} />)}</div>
          )}
        </div>

        <div className={panel}>
          <h2 className="text-sm font-semibold text-foreground mb-4">Coming events (2 weeks)</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No event in the next two weeks.</p>
          ) : (
            <ol className="space-y-3">
              {upcoming.map((b) => {
                const day = new Date(b.eventDate);
                return (
                  <li key={b.id}>
                    <Link href={`/account/bookings/${b.id}`} className="flex items-center gap-3 group">
                      {/* A little calendar page for each event */}
                      <span className="shrink-0 w-12 rounded-xl overflow-hidden border border-border text-center">
                        <span className="block text-[10px] font-bold uppercase py-0.5" style={{ background: "var(--dash-accent)", color: "var(--primary-foreground)" }}>
                          {day.toLocaleDateString("en-GB", { month: "short" })}
                        </span>
                        <span className="block text-lg font-bold text-foreground py-0.5">{day.getDate()}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground truncate group-hover:underline">{b.name ?? b.phone}</span>
                        <span className="block text-xs text-muted-foreground">{untilEvent(b.eventDate)} · {b.selectedItems.length} items</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
