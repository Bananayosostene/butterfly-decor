import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { displaySerif } from "@/lib/fonts";
import { statusLabel } from "@/lib/bookings";
import { getCurrentUser } from "@/lib/user-auth";
import ProfileForm from "./profile-form";

export const metadata: Metadata = { title: "My profile", robots: { index: false } };

const INK = "#2b1807";
const SOFT = "#57422C";
const LINE = "#e8d5b7";

/** A signed-in person's own page: their details and birthday, their bookings and planning list. */
export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [details, bookings, sheet] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { name: true, email: true, phone: true, birthday: true, emailOptOut: true } }),
    prisma.booking.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, eventDate: true, status: true, selectedItems: true, createdAt: true } }),
    prisma.planningSheet.findUnique({ where: { userId: user.id }, select: { submittedAt: true } }),
  ]);
  if (!details) redirect("/login");

  return (
    <div className="min-h-screen pb-24" style={{ background: "#fbf7f2" }}>
      <div className="max-w-3xl mx-auto px-4 pt-8 md:pt-10 space-y-8">
        <header>
          <h1 className={`${displaySerif.className} text-xl md:text-2xl lg:text-3xl`} style={{ color: INK }}>Hello, {details.name}</h1>
          <p className="mt-1 text-sm" style={{ color: SOFT }}>{details.email}</p>
        </header>

        <section className="rounded-2xl bg-white p-5 md:p-6" style={{ border: `1px solid ${LINE}` }}>
          <h2 className={`${displaySerif.className} text-xl`} style={{ color: INK }}>Your details</h2>
          {!details.birthday && (
            <p className="mt-2 text-sm" style={{ color: SOFT }}>Add your birthday and we will celebrate it with you.</p>
          )}
          <ProfileForm
            initial={{ name: details.name, phone: details.phone ?? "", birthday: details.birthday ?? "", emailUpdates: details.emailOptOut !== true }}
          />
        </section>

        <section className="rounded-2xl bg-white p-5 md:p-6" style={{ border: `1px solid ${LINE}` }}>
          <h2 className={`${displaySerif.className} text-xl`} style={{ color: INK }}>Your bookings</h2>
          {bookings.length === 0 ? (
            <p className="mt-2 text-sm" style={{ color: SOFT }}>
              No booking yet. <Link href="/collection" className="underline">See the outfits and decor</Link> and tick the ones you like.
            </p>
          ) : (
            <ul className="mt-3 divide-y" style={{ borderColor: LINE }}>
              {bookings.map((b) => (
                <li key={b.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm" style={{ color: INK }}>
                  <span>
                    Event on {b.eventDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {b.selectedItems.length} item{b.selectedItems.length === 1 ? "" : "s"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#f3e9da", color: INK }}>{statusLabel[b.status] ?? b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 md:p-6" style={{ border: `1px solid ${LINE}` }}>
          <h2 className={`${displaySerif.className} text-xl`} style={{ color: INK }}>Your wedding list</h2>
          <p className="mt-2 text-sm" style={{ color: SOFT }}>
            {sheet?.submittedAt
              ? `Sent to us on ${sheet.submittedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}. `
              : "Make your Gusaba and reception list, then send it to us for prices. "}
            <Link href="/wedding-planning" className="underline">Open the planning list</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
