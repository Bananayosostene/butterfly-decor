import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function BookingsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/admin/login");

  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" } });

  const statusColor = (s: string) =>
    s === "NEW" ? { background: "#fdf6ee", color: "#835105" } :
    s === "CONFIRMED" ? { background: "#f0fdf4", color: "#166534" } :
    { background: "#f1f5f9", color: "#475569" };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{bookings.length} total bookings</p>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground text-sm">No bookings yet.</p>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Phone</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Event Date</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Items</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Created</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-3 text-foreground font-medium">{b.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(b.eventDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.selectedItems.length} item{b.selectedItems.length !== 1 ? "s" : ""}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={statusColor(b.status)}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/bookings/${b.id}`} className="text-xs font-medium" style={{ color: "#3d230c" }}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
