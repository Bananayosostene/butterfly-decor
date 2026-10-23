import Link from "next/link";
import { CalendarDays, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { cldImage } from "@/lib/image";
import { statusLabel, statusStyle, untilEvent } from "@/lib/bookings";

/** Pictures shown on a booking card; the rest is a "+N". */
const THUMBS = 4;

export type BookingSummary = {
  id: string;
  name: string | null;
  phone: string;
  eventDate: Date;
  status: string;
  selectedItems: string[];
  createdAt: Date;
};

/** The first pictures of each booking's items, read in one query for a whole list of bookings. */
const isObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

export async function bookingThumbs(bookings: BookingSummary[]) {
  const ids = [...new Set(bookings.flatMap((b) => b.selectedItems.slice(0, THUMBS)))].filter(isObjectId);
  const items = ids.length ? await prisma.collectionItem.findMany({ where: { id: { in: ids } }, select: { id: true, imageUrl: true, name: true } }) : [];
  return new Map(items.map((i) => [i.id, i]));
}

/** One booking as a card: who, when, what (pictures of the items) and its status. */
export function BookingCard({ booking, thumbs }: { booking: BookingSummary; thumbs: Map<string, { imageUrl: string; name: string }> }) {
  const pictures = booking.selectedItems.slice(0, THUMBS).map((id) => thumbs.get(id)).filter((p): p is { imageUrl: string; name: string } => !!p);
  const more = booking.selectedItems.length - pictures.length;
  return (
    <Link
      href={`/account/bookings/${booking.id}`}
      className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* The items, as a small fan of pictures */}
      <div className="flex shrink-0 -space-x-3">
        {pictures.map((p, i) => (
          <img key={i} src={cldImage(p.imageUrl, 120)} alt={p.name} loading="lazy" className="w-12 h-12 rounded-xl object-cover border-2" style={{ borderColor: "var(--card)", transform: `rotate(${(i - 1.5) * 4}deg)` }} />
        ))}
        {more > 0 && (
          <span className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: "var(--card)", background: "var(--dash-soft)", color: "var(--dash-accent)" }}>
            +{more}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground truncate">{booking.name ?? "Guest customer"}</p>
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={statusStyle(booking.status)}>{statusLabel[booking.status] ?? booking.status}</span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {new Date(booking.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {untilEvent(booking.eventDate)}</span>
          <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {booking.phone}</span>
          <span>{booking.selectedItems.length} item{booking.selectedItems.length === 1 ? "" : "s"}</span>
        </p>
      </div>
      <span className="hidden sm:block shrink-0 text-xs text-muted-foreground">{booking.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
    </Link>
  );
}
