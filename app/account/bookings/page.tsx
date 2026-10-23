import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { parsePage } from "@/lib/data";
import { BOOKING_STATUSES, statusLabel } from "@/lib/bookings";
import { BookingCard, bookingThumbs } from "@/components/account/booking-card";

const PER_PAGE = 20;

/** Every booking, newest first, as cards; filtered by status. */
export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const status = (BOOKING_STATUSES as readonly string[]).includes(params.status ?? "") ? params.status! : "";
  const page = parsePage(params.page);
  const where = status ? { status } : {};

  const [bookings, total, counts] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: { id: true, name: true, phone: true, eventDate: true, status: true, selectedItems: true, createdAt: true },
    }),
    prisma.booking.count({ where }),
    prisma.booking.groupBy({ by: ["status"], _count: { status: true } }),
  ]);
  const thumbs = await bookingThumbs(bookings);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count.status ?? 0;
  const all = counts.reduce((n, c) => n + c._count.status, 0);
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (nextStatus: string, nextPage = 1) => {
    const query = new URLSearchParams({ ...(nextStatus && { status: nextStatus }), ...(nextPage > 1 && { page: String(nextPage) }) }).toString();
    return `/account/bookings${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap gap-2">
        {[{ value: "", label: "All", count: all }, ...BOOKING_STATUSES.map((s) => ({ value: s, label: statusLabel[s], count: countOf(s) }))].map((tab) => (
          <Link
            key={tab.label}
            href={href(tab.value)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border border-border"
            style={status === tab.value ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--foreground)" }}
          >
            {tab.label} · {tab.count}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground text-sm">No bookings here.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => <BookingCard key={b.id} booking={b} thumbs={thumbs} />)}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Page {page} of {lastPage}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={href(status, page - 1)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent">Newer</Link>}
            {page < lastPage && <Link href={href(status, page + 1)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent">Older</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
