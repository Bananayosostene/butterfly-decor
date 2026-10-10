import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { hasPrices, money, readEntries, sheetTotal } from "@/lib/planning-sheet";

/** Planning lists that customers sent, newest first. */
export default async function PlanningListsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const sheets = await prisma.planningSheet.findMany({
    where: { submittedAt: { not: null } },
    orderBy: { submittedAt: "desc" },
    take: 200,
  });
  const users = await prisma.user.findMany({
    where: { id: { in: sheets.map((s) => s.userId) } },
    select: { id: true, name: true, email: true, phone: true },
  });
  const userOf = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{sheets.length} list{sheets.length !== 1 ? "s" : ""} sent by customers</p>

      {sheets.length === 0 ? (
        <p className="text-muted-foreground text-sm">No customer has sent a planning list yet.</p>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Wedding date</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Records</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Total</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Sent</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {sheets.map((s) => {
                  const user = userOf.get(s.userId);
                  const entries = readEntries(s.entries);
                  return (
                    <tr key={s.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <p className="text-foreground font-medium">{user?.name ?? "Deleted account"}</p>
                        <p className="text-xs text-muted-foreground">{user?.phone || user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.weddingDate ? s.weddingDate.split("-").reverse().join("/") : "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{entries.GUSABA.length + entries.RECEPTION.length}</td>
                      <td className="px-4 py-3">
                        {hasPrices(entries) ? (
                          <span className="text-foreground font-medium">{money(sheetTotal(entries))}</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "var(--dash-soft)", color: "var(--dash-accent)" }}>No prices yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.submittedAt!.toLocaleDateString("en-GB")}</td>
                      <td className="px-4 py-3">
                        <Link href={`/account/planning-lists/${s.id}`} className="text-xs font-medium" style={{ color: "var(--dash-accent)" }}>Open</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
