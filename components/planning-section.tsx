import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardCheck, Store, Users, Wallet, Sparkles } from "lucide-react";
import { displaySerif } from "@/lib/fonts";
import { WEDDING_PLANS } from "@/lib/wedding-plans";

const INK = "#2b1807";
const GOLD = "#835105";
const SOFT = "#57422C";
const LINE = "#e8d5b7";

/** Sample tiles of the "at a glance" preview card (illustration only, not live data). */
const GLANCE = [
  { icon: ClipboardCheck, title: "Checklist", note: "4 tasks · 2 this week", progress: 62 },
  { icon: Users, title: "Guests", note: "180 guests listed" },
  { icon: Store, title: "Vendors", note: "5 booked · 2 to confirm" },
  { icon: Wallet, title: "Budget", note: "67% allocated", progress: 67 },
  { icon: CalendarDays, title: "Ceremonies", note: "Gusaba · Civil · Church" },
  { icon: Sparkles, title: "Decor", note: "Theme chosen" },
];

const STATS = [
  { value: `${WEDDING_PLANS.length}`, label: "Planning timelines" },
  { value: `${WEDDING_PLANS.reduce((n, p) => n + p.phases.length, 0)}`, label: "Guided phases" },
  { value: "100%", label: "Free to use" },
];

/** Homepage section under the hero that introduces the wedding planner. */
export function PlanningSection() {
  return (
    <section className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-16 border-b" style={{ background: "#fbf7f2", borderColor: LINE }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-10 md:gap-14 items-center">
        {/* Preview card */}
        <div className="rounded-3xl p-6 md:p-8" style={{ background: "#f3e9da" }} aria-hidden>
          <p className={`${displaySerif.className} text-2xl md:text-3xl text-center`} style={{ color: INK }}>
            Your Wedding at a Glance
          </p>
          <p className="mx-auto mt-3 w-fit px-5 py-1.5 rounded-full text-sm" style={{ background: "rgba(43,24,7,0.07)", color: INK }}>
            120 days to go until the big day
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {GLANCE.map((tile) => (
              <div key={tile.title} className="rounded-2xl p-3 bg-white shadow-sm min-h-[104px]">
                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#f7efe3", color: GOLD }}>
                  <tile.icon size={14} />
                </span>
                <p className={`${displaySerif.className} mt-2 text-sm`} style={{ color: INK }}>{tile.title}</p>
                <p className="text-[10px] leading-snug" style={{ color: SOFT }}>{tile.note}</p>
                {tile.progress !== undefined && (
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "#f0e6d6" }}>
                    <div className="h-full rounded-full" style={{ width: `${tile.progress}%`, background: GOLD }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pitch */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: INK }}>Why Butterfly</p>
          <h2 className={`${displaySerif.className} mt-3 text-2xl md:text-4xl leading-[1.1]`} style={{ color: INK }}>
            The Free Online Wedding Planner
          </h2>
          <p className="mt-4 max-w-xl text-sm md:text-base leading-relaxed" style={{ color: SOFT }}>
            Plan your wedding with a guide at your side. Tell us how much time you have, and we walk you through it
            phase by phase, what to decide, what to book and when, from the first family visit to the wedding day.
          </p>
          <Link
            href="/wedding-planning"
            className="group mt-6 inline-flex items-center gap-4 pl-7 pr-2 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
            style={{ background: INK, color: "#f7efe3" }}
          >
            Let&apos;s plan your wedding
            <span className="w-9 h-9 rounded-full flex items-center justify-center border transition-transform group-hover:translate-x-0.5" style={{ borderColor: "rgba(247,239,227,0.6)" }}>
              <ArrowRight size={16} strokeWidth={1.5} />
            </span>
          </Link>

          <dl className="mt-8 pt-6 border-t grid grid-cols-3 gap-4" style={{ borderColor: LINE }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <dd className={`${displaySerif.className} text-4xl md:text-5xl`} style={{ color: INK }}>{s.value}</dd>
                <dt className="mt-2 text-[10px] md:text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: SOFT }}>{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
