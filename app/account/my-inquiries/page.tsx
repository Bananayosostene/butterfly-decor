import { redirect } from "next/navigation";
import { CalendarDays, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/user-auth";

/** Messages couples sent to this vendor from the vendor's page. */
export default async function MyInquiriesPage() {
  const user = await getCurrentUser();
  if (user?.role !== "VENDOR") redirect("/login");

  const inquiries = await prisma.inquiry.findMany({ where: { vendorId: user.id }, orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-sm text-muted-foreground">
        {inquiries.length} message{inquiries.length === 1 ? "" : "s"} from couples who found you on Butterfly Decor.
      </p>
      {inquiries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No message yet. Pages with many good photos receive the most messages.</p>
      ) : (
        <div className="space-y-3">
          {inquiries.map((q) => (
            <div key={q.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.createdAt.toLocaleString("en-GB", { timeZone: "Africa/Kigali", dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <p className="mt-2 text-sm text-foreground whitespace-pre-line">{q.message}</p>
              <p className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {q.eventDate && <span className="inline-flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Event on {q.eventDate.split("-").reverse().join("/")}</span>}
                {q.phone && <a href={`tel:${q.phone}`} className="inline-flex items-center gap-1 hover:underline"><Phone className="w-3.5 h-3.5" /> {q.phone}</a>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
