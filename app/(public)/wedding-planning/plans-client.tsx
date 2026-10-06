"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check } from "lucide-react";
import { displaySerif } from "@/lib/fonts";
import type { WeddingPlan } from "@/lib/wedding-plans";

const INK = "#2b1807";
const GOLD = "#835105";
const SOFT = "#57422C";
const LINE = "#e8d5b7";

export default function PlansClient({ plans }: { plans: WeddingPlan[] }) {
  // Starts on the standard (longest) timeline.
  const [activeSlug, setActiveSlug] = useState(plans[0].slug);
  const plan = plans.find((p) => p.slug === activeSlug) ?? plans[0];

  return (
    <div className="min-h-screen pb-20" style={{ background: "#fbf7f2" }}>
      <div className="max-w-5xl mx-auto px-4 pt-10">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Wedding planning</p>
          <h1 className={`${displaySerif.className} mt-2 text-4xl md:text-5xl`} style={{ color: INK }}>
            How much time do you have?
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-sm md:text-base leading-relaxed" style={{ color: SOFT }}>
            Pick the time left before your wedding. Each timeline shows what it requires, so you can see whether it is
            possible for you, and the phases you will go through.
          </p>
        </header>

        {/* Timeline tabs */}
        <div role="tablist" aria-label="Time before the wedding" className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {plans.map((p) => {
            const active = p.slug === plan.slug;
            return (
              <button
                key={p.slug}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveSlug(p.slug)}
                className="relative rounded-lg px-4 py-5 text-sm font-semibold transition-colors cursor-pointer"
                style={active ? { background: INK, color: "#f7efe3" } : { background: "#fff", color: INK, border: `1px solid ${LINE}` }}
              >
                {p.tab}
                {/* Small pointer under the selected tab */}
                {active && (
                  <span className="hidden md:block absolute left-1/2 -bottom-1.5 w-3 h-3 -translate-x-1/2 rotate-45" style={{ background: INK }} />
                )}
              </button>
            );
          })}
        </div>

        {/* The selected plan */}
        <article className="mt-8 rounded-2xl bg-white p-5 md:p-8 grid md:grid-cols-[260px_1fr] gap-6 md:gap-8" style={{ border: `1px solid ${LINE}` }}>
          <div className="rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[180px]" style={{ background: "#f3e9da" }}>
            <CalendarDays size={22} style={{ color: GOLD }} />
            <p className={`${displaySerif.className} mt-3 text-4xl leading-none`} style={{ color: INK }}>{plan.tab}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] font-semibold" style={{ color: SOFT }}>
              {plan.phases.length} phases
            </p>
          </div>

          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.1em]" style={{ color: INK }}>{plan.title}</h2>
            <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold" style={{ color: INK }}>
              <CalendarDays size={15} /> {plan.duration}
            </p>
            <p className="mt-3 text-sm md:text-base leading-relaxed" style={{ color: SOFT }}>{plan.description}</p>
            <p className="mt-2 text-sm" style={{ color: INK }}>
              <span className="font-bold">Best for:</span> {plan.bestFor}
            </p>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: GOLD }}>What you need</p>
              <ul className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {plan.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm" style={{ color: INK }}>
                    <Check size={15} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <Link
                href={`/wedding-planning/${plan.slug}`}
                className="group inline-flex items-center gap-3 px-7 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: INK, color: "#f7efe3" }}
              >
                Start this plan
                <ArrowRight size={17} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </article>

        {/* Its phases */}
        <h2 className={`${displaySerif.className} mt-10 text-2xl md:text-3xl`} style={{ color: INK }}>The phases of this plan</h2>
        <ol className="mt-4 space-y-3">
          {plan.phases.map((phase, i) => (
            <li key={phase.title} className="rounded-2xl bg-white p-5 md:p-6 grid md:grid-cols-[200px_1fr] gap-3 md:gap-8" style={{ border: `1px solid ${LINE}` }}>
              <div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold" style={{ border: `2px solid ${GOLD}`, color: GOLD }}>
                  {i + 1}
                </span>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: GOLD }}>{phase.period}</p>
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold" style={{ color: INK }}>{phase.title}</h3>
                <p className="mt-1 text-sm" style={{ color: SOFT }}>{phase.summary}</p>
                <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {phase.activities.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm" style={{ color: INK }}>
                      <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: GOLD }} />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
