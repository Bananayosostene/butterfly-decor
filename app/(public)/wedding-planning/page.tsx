import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Download, Images, PencilLine, Send, Store } from "lucide-react";
import { displaySerif } from "@/lib/fonts";
import { getPlanningSections, getUserSheet } from "@/lib/planning-data";
import { isDate, withFirstRecord } from "@/lib/planning-sheet";
import { getCurrentUser, getDashboardUser } from "@/lib/user-auth";
import { WEDDING_PLANS } from "@/lib/wedding-plans";
import SheetClient from "./sheet-client";

export const metadata: Metadata = {
  title: "Wedding Planning",
  description: "Make your Introduction and Reception list, send it to us and download it as a PDF.",
};

const INK = "#2b1807";
const GOLD = "#835105";
const SOFT = "#57422C";
const LINE = "#e8d5b7";

const HOW = [
  { icon: PencilLine, text: "Add your list" },
  { icon: Send, text: "Send it to us" },
  { icon: Download, text: "Download PDF" },
];

/** The planning sheet (Introduction + Reception) for signed-in visitors, and short timelines. */
export default async function WeddingPlanningPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const [{ date }, user, dashboardUser, sections] = await Promise.all([
    searchParams,
    getCurrentUser(),
    getDashboardUser(),
    getPlanningSections(),
  ]);
  if (!user && !dashboardUser) redirect("/login");

  const sheet = user ? await getUserSheet(user.id) : { weddingDate: null, entries: { GUSABA: [], RECEPTION: [] }, submitted: false };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#fbf7f2" }}>
      <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-10">
        <header className="text-center">
          <h1 className={`${displaySerif.className} text-2xl md:text-3xl`} style={{ color: INK }}>
            Plan your wedding
          </h1>
          {/* Three pictures instead of a paragraph */}
          <ol className="mt-5 flex items-start justify-center gap-3 md:gap-8">
            {HOW.map((step, i) => (
              <li key={step.text} className="flex flex-col items-center gap-2 w-24 md:w-32">
                <span className="relative w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#f3e9da", color: GOLD }}>
                  <step.icon size={20} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center" style={{ background: INK, color: "#f7efe3" }}>
                    {i + 1}
                  </span>
                </span>
                <span className="text-xs md:text-sm font-medium leading-tight" style={{ color: INK }}>{step.text}</span>
              </li>
            ))}
          </ol>
        </header>

        <div className="mt-8">
          <SheetClient
            sections={sections}
            // Each part starts with one empty record; the customer adds the rest one by one.
            initialEntries={withFirstRecord(sheet.entries)}
            // A date typed on the homepage wins over the saved one.
            initialDate={isDate(date) ? date : sheet.weddingDate ?? ""}
            customer={{ name: user?.name ?? "", email: user?.email ?? "" }}
            canSave={!!user}
            submitted={sheet.submitted}
          />
        </div>


        {/* Short timelines */}
        <section className="mt-12">
          <h2 className={`${displaySerif.className} text-2xl md:text-3xl text-center`} style={{ color: INK }}>
            How much time do you have?
          </h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {WEDDING_PLANS.map((plan) => (
              <article key={plan.slug} className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${LINE}` }}>
                <p className={`${displaySerif.className} text-2xl md:text-3xl`} style={{ color: INK }}>{plan.time}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>{plan.note}</p>
                <ol className="mt-4 space-y-3">
                  {plan.steps.map((step, i) => (
                    <li key={step.when} className="flex gap-3">
                      <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full text-xs font-bold flex items-center justify-center" style={{ background: "#f3e9da", color: INK }}>
                        {i + 1}
                      </span>
                      <span className="text-sm leading-snug" style={{ color: INK }}>
                        <span className="block text-xs" style={{ color: SOFT }}>{step.when}</span>
                        {step.what}
                      </span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
