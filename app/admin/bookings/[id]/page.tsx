import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/admin/login");

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) redirect("/admin/bookings");

  const statusColor = (s: string) =>
    s === "NEW" ? { background: "#fdf6ee", color: "#835105" } :
    s === "CONFIRMED" ? { background: "#f0fdf4", color: "#166534" } :
    { background: "#f1f5f9", color: "#475569" };

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/bookings" className="text-sm text-muted-foreground hover:text-foreground">← Back to Bookings</Link>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Booking Details</h2>
          <span className="px-3 py-1 rounded-full text-xs font-medium" style={statusColor(booking.status)}>{booking.status}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Phone</p>
            <p className="text-foreground font-medium">{booking.phone}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Event Date</p>
            <p className="text-foreground font-medium">{new Date(booking.eventDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Created</p>
            <p className="text-foreground">{new Date(booking.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Selected Items</p>
            <p className="text-foreground">{booking.selectedItems.length} item{booking.selectedItems.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {booking.selectedItems.length > 0 && (
          <div>
            <p className="text-muted-foreground text-xs mb-2">Item IDs</p>
            <div className="flex flex-wrap gap-1">
              {booking.selectedItems.map((id) => (
                <span key={id} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">{id}</span>
              ))}
            </div>
          </div>
        )}

        {booking.adminNotes && (
          <div>
            <p className="text-muted-foreground text-xs mb-1">Admin Notes</p>
            <p className="text-foreground text-sm">{booking.adminNotes}</p>
          </div>
        )}
      </div>

      {/* Status Update */}
      <form action={async (fd: FormData) => {
        "use server";
        const status = fd.get("status") as string;
        const notes = fd.get("notes") as string;
        await prisma.booking.update({ where: { id: params.id }, data: { status, adminNotes: notes } });
        redirect(`/admin/bookings/${params.id}`);
      }} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Update Status</h3>
        <select name="status" defaultValue={booking.status} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
          <option value="NEW">NEW</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
        <textarea name="notes" defaultValue={booking.adminNotes ?? ""} placeholder="Admin notes..." rows={3} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground resize-none" />
        <button type="submit" className="px-4 py-2 text-sm rounded-lg font-medium" style={{ background: "#2b1807", color: "#e8d5b7" }}>
          Update
        </button>
      </form>
    </div>
  );
}
