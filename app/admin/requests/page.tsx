import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function BookingsPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl   font-bold text-foreground">
              All Bookings
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {bookings.length === 0 ? (
          <p className="text-muted-foreground">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Client Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Event Type
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Event Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 text-foreground">
                      {booking.fullName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {booking.eventType}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(booking.eventDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {booking.eventLocation}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/requests/${booking.id}`}
                        className="text-accent hover:opacity-80 font-medium transition-smooth"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
