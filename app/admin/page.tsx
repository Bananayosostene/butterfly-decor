import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  // Protect admin page
  if (!sessionToken) {
    redirect("/admin/login");
  }

  // Verify session
  const adminUser = await prisma.adminUser.findFirst();
  if (!adminUser || !sessionToken) {
    redirect("/admin/login");
  }

  // Fetch dashboard data
  const totalBookings = await prisma.booking.count();
  const newBookings = await prisma.booking.count({ where: { status: "NEW" } });
  const confirmedBookings = await prisma.booking.count({
    where: { status: "CONFIRMED" },
  });

  const upcomingEvents = await prisma.booking.findMany({
    where: {
      eventDate: {
        gte: new Date(),
      },
    },
    orderBy: { eventDate: "asc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl   font-bold text-foreground">
            Butterfly Events Ltd Admin
          </h1>
          <form
            action={async () => {
              "use server";
              const cookies_store = await cookies();
              cookies_store.delete("admin_session");
              redirect("/admin/login");
            }}
          >
            <button
              type="submit"
              className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-smooth text-sm font-medium"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground text-sm font-medium mb-2">
              Total Bookings
            </p>
            <p className="text-4xl font-bold text-primary">{totalBookings}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground text-sm font-medium mb-2">
              New Bookings
            </p>
            <p className="text-4xl font-bold text-accent">{newBookings}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground text-sm font-medium mb-2">
              Confirmed
            </p>
            <p className="text-4xl font-bold text-green-600">
              {confirmedBookings}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/admin/bookings"
            className="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-smooth"
          >
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-semibold text-foreground mb-1">
              Manage Bookings
            </h3>
            <p className="text-sm text-muted-foreground">
              View and update booking statuses
            </p>
          </Link>

          <Link
            href="/admin/portfolio"
            className="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-smooth"
          >
            <div className="text-3xl mb-2">🖼️</div>
            <h3 className="font-semibold text-foreground mb-1">
              Manage Portfolio
            </h3>
            <p className="text-sm text-muted-foreground">
              Upload and manage gallery images
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-smooth"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="font-semibold text-foreground mb-1">Settings</h3>
            <p className="text-sm text-muted-foreground">
              Manage admin account
            </p>
          </Link>
        </div>

        {/* Upcoming Events */}
        <div>
          <h2 className="text-2xl   font-bold text-foreground mb-6">
            Upcoming Events
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground">No upcoming events</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/bookings/${event.id}`}
                  className="p-4 bg-card border border-border rounded-lg hover:shadow-lg transition-smooth"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {event.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {event.eventType} •{" "}
                        {new Date(event.eventDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.eventLocation}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">
                      {event.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
