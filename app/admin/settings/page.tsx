import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/admin/login");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">

        <div>
          <h2 className="font-semibold text-foreground mb-2">Admin Account</h2>
          <p className="text-sm text-muted-foreground">Session duration is 7 days. Password changes must be done through the database directly.</p>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="font-semibold text-foreground mb-2">Cloudinary</h2>
          <p className="text-sm text-muted-foreground">Images are uploaded to Cloudinary. Configure <code className="text-xs bg-muted px-1 py-0.5 rounded">CLOUDINARY_CLOUD_NAME</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">CLOUDINARY_API_KEY</code>, and <code className="text-xs bg-muted px-1 py-0.5 rounded">CLOUDINARY_API_SECRET</code> in your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> file.</p>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="font-semibold text-foreground mb-2">WhatsApp</h2>
          <p className="text-sm text-muted-foreground">Booking confirmations are sent via WhatsApp. Update the phone number in <code className="text-xs bg-muted px-1 py-0.5 rounded">app/api/request/route.ts</code> and relevant components.</p>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="font-semibold text-foreground mb-2">Security</h2>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Sessions stored in secure HTTP-only cookies</li>
            <li>Passwords hashed with SHA-256</li>
            <li>Never share admin credentials</li>
          </ul>
        </div>

        <div className="border-t border-border pt-6">
          <form action={async () => {
            "use server";
            const { cookies: getCookies } = await import("next/headers");
            (await getCookies()).delete("admin_session");
            redirect("/admin/login");
          }}>
            <button type="submit" className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted font-medium">
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
