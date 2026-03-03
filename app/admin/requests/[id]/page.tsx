import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
  });

  if (!booking) {
    redirect("/admin/requests");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/admin/requests"
            className="text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Bookings
          </Link>
          <h1 className="text-2xl   font-bold text-foreground">
            Booking Details
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-lg p-8 space-y-6">
          {/* Client Info */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Client Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium text-foreground">
                  {booking.fullName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium text-foreground">{booking.phone}</p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Event Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Event Type</p>
                <p className="font-medium text-foreground">
                  {booking.eventType}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Event Date</p>
                <p className="font-medium text-foreground">
                  {new Date(booking.eventDate).toLocaleDateString()}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">
                  {booking.eventLocation}
                </p>
              </div>
              {booking.preferredColors && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Preferred Colors
                  </p>
                  <p className="font-medium text-foreground">
                    {booking.preferredColors}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Client Notes
              </h2>
              <p className="text-foreground">{booking.notes}</p>
            </div>
          )}

          {/* Admin Status */}
          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Status
            </h2>
            <p className="font-medium text-foreground mb-2">
              Current Status: {booking.status}
            </p>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
