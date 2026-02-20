import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl   font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-lg p-8 space-y-8">
          {/* Admin Account */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Admin Account
            </h2>
            <p className="text-muted-foreground mb-4">
              Manage your admin account settings. For security, password changes
              should be done through the database.
            </p>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                <strong>Session Duration:</strong> 7 days
              </p>
              <p className="text-muted-foreground">
                <strong>Last Login:</strong> Stored in your browser
              </p>
            </div>
          </div>

          {/* WhatsApp Contact */}
          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              WhatsApp Integration
            </h2>
            <p className="text-muted-foreground mb-4">
              Booking confirmations are sent via WhatsApp. Make sure your
              WhatsApp number is configured in the application.
            </p>
            <p className="text-sm text-muted-foreground">
              Update the phone number in the booking-related pages and
              components to receive notifications.
            </p>
          </div>

          {/* Security Info */}
          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Security
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Sessions are stored in secure HTTP-only cookies</li>
              <li>Passwords are hashed using SHA-256</li>
              <li>Change your password regularly for security</li>
              <li>Never share your admin credentials</li>
            </ul>
          </div>

          {/* Logout */}
          <div className="border-t border-border pt-8">
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
                className="px-6 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-smooth"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
