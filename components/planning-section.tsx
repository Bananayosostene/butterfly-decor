import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { displaySerif } from "@/lib/fonts";
import { getPlanningSections } from "@/lib/planning-data";

const INK = "var(--ink)";
const GOLD = "#835105";
const SOFT = "#57422C";
const LINE = "#e8d5b7";

/** Made-up answers for the example table (illustration only, not anyone's data). */
const SAMPLE = ["1", "1", "1", "1", "6"];

const STATS = [
  { value: "2 Parts", label: "Introduction & Reception" },
  { value: "PDF", label: "Download and print" },
  { value: "100%", label: "Free to use" },
];

/** Homepage section under the hero that introduces the wedding planner. */
export async function PlanningSection() {
  const [sheet] = await getPlanningSections();
  const column = sheet.columns[0];

  return (
    <section className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-16 border-b" style={{ background: "#fbf7f2", borderColor: LINE }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-10 md:gap-14 items-center">
        {/* Example of the planning sheet */}
        <div className="rounded-3xl p-5 md:p-8" style={{ background: "#f3e9da" }} aria-hidden>
          <p className={`${displaySerif.className} text-xl md:text-2xl text-center`} style={{ color: INK }}>
            wedding planning sheet
          </p>
          <p className="mx-auto mt-3 w-fit px-5 py-1.5 rounded-full text-sm" style={{ background: "rgba(43,24,7,0.07)", color: INK }}>
            1. {sheet.title}
          </p>
          <div className="mt-5 rounded-xl overflow-hidden bg-white shadow-sm text-xs md:text-sm" style={{ border: "1px solid #e0c896" }}>
            <div className="flex items-center gap-2 px-3 py-2 font-semibold" style={{ background: INK, color: "#fff" }}>
              <span className="w-6 text-center">No</span>
              <span className="flex-1 truncate">{sheet.rowsLabel}</span>
              <span className="w-24 text-center truncate">{column.label}</span>
            </div>
            {sheet.rows.slice(0, SAMPLE.length).map((row, i) => (
              <div key={row.id} className="flex items-center gap-2 px-3 py-2.5" style={{ borderTop: "1px solid #eadcbd", background: i % 2 ? "#fff" : "#fffcf4", color: INK }}>
                <span className="w-6 text-center font-bold">{i + 1}</span>
                <span className="flex-1 truncate">{row.label}</span>
                <span className="w-24 text-center font-semibold" style={{ color: GOLD }}>{SAMPLE[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pitch */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: INK }}>Why Butterfly</p>
          <h2 className={`${displaySerif.className} mt-3 text-xl md:text-2xl leading-[1.1]`} style={{ color: INK }}>
            The Free Online Wedding Planner
          </h2>
          <p className="mt-4 max-w-xl text-xs md:text-sm leading-relaxed" style={{ color: SOFT }}>
            Choose who will be dressed for your Introduction and your Reception, and how many.
            Send us the list, get the prices, and download it as a PDF.
          </p>
          <Link
            href="/wedding-planning"
            className="group mt-6 inline-flex items-center gap-4 pl-7 pr-2 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
            style={{ background: INK, color: "var(--cream)" }}
          >
            Let&apos;s plan your wedding
            <span className="w-9 h-9 rounded-full flex items-center justify-center border transition-transform group-hover:translate-x-0.5" style={{ borderColor: "rgba(247,239,227,0.6)" }}>
              <ArrowRight size={16} strokeWidth={1.5} />
            </span>
          </Link>

          <dl className="mt-8 pt-6 border-t grid grid-cols-3 gap-4" style={{ borderColor: LINE }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <dd className={`${displaySerif.className} text-xl md:text-2xl`} style={{ color: INK }}>{s.value}</dd>
                <dt className="mt-2 text-sm md:text-xs font-semibold " style={{ color: SOFT }}>{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
