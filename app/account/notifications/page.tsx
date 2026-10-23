import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { notificationScope } from "@/lib/notifications";

const kigali = (date: Date) => date.toLocaleString("en-GB", { timeZone: "Africa/Kigali", dateStyle: "medium", timeStyle: "short" });

/** Every notification of the admin (or of the signed-in vendor), newest first. */
export default async function NotificationsPage() {
  const scope = await notificationScope();
  if (!scope) redirect("/login");

  const notices = await prisma.notification.findMany({ where: scope, orderBy: { createdAt: "desc" }, take: 150 });

  async function markAllRead() {
    "use server";
    const current = await notificationScope();
    if (!current) redirect("/login");
    await prisma.notification.updateMany({ where: { ...current, readAt: null }, data: { readAt: new Date() } });
    redirect("/account/notifications");
  }

  const unread = notices.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{unread ? `${unread} unread` : "All read"}</p>
        {unread > 0 && (
          <form action={markAllRead}>
            <button className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-accent">Mark all read</button>
          </form>
        )}
      </div>
      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        {notices.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</p>}
        {notices.map((n) => {
          const content = (
            <div className="flex gap-3 p-4">
              <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full" style={{ background: n.readAt ? "transparent" : "var(--dash-accent)" }} />
              <div className="min-w-0">
                <p className={`text-sm ${n.readAt ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.title}</p>
                {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-[11px] text-muted-foreground">{kigali(n.createdAt)} · {n.type.toLowerCase()}</p>
              </div>
            </div>
          );
          return n.href ? <Link key={n.id} href={n.href} className="block hover:bg-accent/40">{content}</Link> : <div key={n.id}>{content}</div>;
        })}
      </div>
    </div>
  );
}
