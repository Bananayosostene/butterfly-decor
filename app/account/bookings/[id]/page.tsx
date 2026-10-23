import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Download, Mail, Phone, UserRound } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionAdminId } from "@/lib/auth";
import { isObjectId } from "@/lib/data";
import { cldImage } from "@/lib/image";
import { itemHref } from "@/lib/category-icons";
import { BOOKING_STATUSES, statusLabel, statusStyle, untilEvent } from "@/lib/bookings";

/** Items shown per page; a booking can hold thousands. */
const PER_PAGE = 60;

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ cat?: string; page?: string }> };

/** One booking: who booked, when the event is, every item they chose (grouped by category). */
export default async function BookingDetailPage({ params, searchParams }: Props) {
  const [{ id }, { cat, page: rawPage }, cookieStore] = await Promise.all([params, searchParams, cookies()]);
  if (!cookieStore.get("admin_session")?.value) redirect("/login");
  if (!isObjectId(id)) notFound();

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) notFound();

  // How many chosen items are in each category, for the summary and the filter.
  const grouped = booking.selectedItems.length
    ? await prisma.collectionItem.groupBy({ by: ["categoryId"], where: { id: { in: booking.selectedItems } }, _count: { categoryId: true } })
    : [];
  const categories = await prisma.category.findMany({ where: { id: { in: grouped.map((g) => g.categoryId) } }, select: { id: true, name: true } });
  const nameOf = new Map(categories.map((c) => [c.id, c.name.trim()]));
  const summary = grouped
    .map((g) => ({ id: g.categoryId, name: nameOf.get(g.categoryId) ?? "Other", count: g._count.categoryId }))
    .sort((a, b) => b.count - a.count);
  const found = summary.reduce((n, g) => n + g.count, 0);
  const missing = booking.selectedItems.length - found;

  const category = cat && summary.some((g) => g.id === cat) ? cat : "";
  const totalShown = category ? summary.find((g) => g.id === category)!.count : found;
  const lastPage = Math.max(1, Math.ceil(totalShown / PER_PAGE));
  const page = Math.min(lastPage, Math.max(1, parseInt(rawPage ?? "1", 10) || 1));
  const items = await prisma.collectionItem.findMany({
    where: { id: { in: booking.selectedItems }, ...(category && { categoryId: category }) },
    orderBy: [{ categoryId: "asc" }, { name: "asc" }],
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
    select: { id: true, name: true, imageUrl: true, categoryId: true },
  });

  const href = (nextCat: string, nextPage = 1) => {
    const query = new URLSearchParams({ ...(nextCat && { cat: nextCat }), ...(nextPage > 1 && { page: String(nextPage) }) }).toString();
    return `/account/bookings/${id}${query ? `?${query}` : ""}`;
  };

  async function updateBooking(fd: FormData) {
    "use server";
    // A server action can be called directly, so it checks the admin session itself.
    const store = await cookies();
    if (!(await getSessionAdminId(store.get("admin_session")?.value))) redirect("/login");
    const status = String(fd.get("status"));
    await prisma.booking.update({
      where: { id },
      data: {
        status: (BOOKING_STATUSES as readonly string[]).includes(status) ? status : undefined,
        adminNotes: String(fd.get("notes") ?? "").slice(0, 2000),
      },
    });
    redirect(`/account/bookings/${id}`);
  }

  const eventDay = new Date(booking.eventDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6 max-w-6xl">
      <Link href="/account/bookings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> All bookings
      </Link>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Customer and event */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Booking</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">{booking.name ?? "Guest customer"}</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={statusStyle(booking.status)}>{statusLabel[booking.status] ?? booking.status}</span>
          </div>
          <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <CalendarDays className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--dash-accent)" }} />
              <div>
                <p className="text-foreground font-medium">{eventDay}</p>
                <p className="text-xs text-muted-foreground">Event {untilEvent(booking.eventDate)}</p>
              </div>
            </div>
            <a href={`tel:${booking.phone.replace(/\s/g, "")}`} className="flex items-start gap-3 hover:underline">
              <Phone className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--dash-accent)" }} />
              <span className="text-foreground font-medium">{booking.phone}</span>
            </a>
            {booking.email && (
              <a href={`mailto:${booking.email}`} className="flex items-start gap-3 hover:underline">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--dash-accent)" }} />
                <span className="text-foreground break-all">{booking.email}</span>
              </a>
            )}
            <div className="flex items-start gap-3">
              <UserRound className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--dash-accent)" }} />
              <span className="text-muted-foreground">
                {booking.userId ? "Signed-in customer" : "Booked without an account"} · sent {booking.createdAt.toLocaleString("en-GB", { timeZone: "Africa/Kigali", dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <form action={updateBooking} className="bg-card border border-border rounded-2xl p-6 space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Status and notes</h3>
          <select name="status" defaultValue={booking.status} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
            {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
          </select>
          <textarea name="notes" defaultValue={booking.adminNotes ?? ""} placeholder="Notes for yourself (price agreed, delivery time…)" rows={3} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground resize-none" />
          <button type="submit" className="w-full px-4 py-2 text-sm rounded-lg font-medium" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            Save
          </button>
        </form>
      </div>

      {/* Items */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-foreground">
            {booking.selectedItems.length} item{booking.selectedItems.length === 1 ? "" : "s"} chosen
          </h3>
          {booking.selectedItems.length > 0 && (
            <a href={`/api/request/${id}/items`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent">
              <Download className="w-4 h-4" /> Download the list (CSV)
            </a>
          )}
        </div>

        {/* One chip per category; a click shows only that category */}
        {summary.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <Link href={href("")} className="px-3 py-1.5 rounded-full text-xs font-medium border border-border" style={!category ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--foreground)" }}>
              All · {found}
            </Link>
            {summary.map((g) => (
              <Link key={g.id} href={href(g.id)} className="px-3 py-1.5 rounded-full text-xs font-medium border border-border" style={category === g.id ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--foreground)" }}>
                {g.name} · {g.count}
              </Link>
            ))}
          </div>
        )}
        {missing > 0 && <p className="text-xs text-muted-foreground">{missing} chosen item{missing === 1 ? " has" : "s have"} since been deleted from the collection.</p>}

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items to show.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {items.map((item, i) => (
              <a key={item.id} href={itemHref(item.id)} target="_blank" className="group block">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                  <img src={cldImage(item.imageUrl, 300)} alt="" loading={i < 12 ? "eager" : "lazy"} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white">{(page - 1) * PER_PAGE + i + 1}</span>
                </div>
                <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-2">{item.name}</p>
                <p className="text-[11px] text-muted-foreground">{nameOf.get(item.categoryId)}</p>
              </a>
            ))}
          </div>
        )}

        {lastPage > 1 && (
          <div className="flex items-center justify-between text-sm pt-2">
            <p className="text-muted-foreground">Page {page} of {lastPage}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={href(category, page - 1)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent">Previous</Link>}
              {page < lastPage && <Link href={href(category, page + 1)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent">Next</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
