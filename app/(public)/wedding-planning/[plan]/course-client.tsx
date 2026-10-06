"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, PartyPopper, Play } from "lucide-react";
import { displaySerif } from "@/lib/fonts";
import type { CourseStep } from "@/lib/wedding-plans";

const INK = "#2b1807";
const GOLD = "#835105";
const SOFT = "#57422C";
const LINE = "#e8d5b7";

/** What the couple has done in a course. Kept in the browser until the backend exists. */
type Progress = { done: string[]; picks: Record<string, string[]>; current: string };

const storageKey = (slug: string) => `bfly-plan-${slug}`;

export default function CourseClient({
  plan,
  steps,
}: {
  plan: { slug: string; title: string; duration: string };
  steps: CourseStep[];
}) {
  const [progress, setProgress] = useState<Progress>({ done: [], picks: {}, current: steps[0].id });

  // Pick up where the couple left off on this device.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(plan.slug));
      if (saved) setProgress((p) => ({ ...p, ...JSON.parse(saved) }));
    } catch {}
  }, [plan.slug]);

  const update = (next: Progress) => {
    setProgress(next);
    try {
      localStorage.setItem(storageKey(plan.slug), JSON.stringify(next));
    } catch {}
  };

  const index = Math.max(0, steps.findIndex((s) => s.id === progress.current));
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const doneCount = steps.filter((s) => progress.done.includes(s.id)).length;
  const percent = Math.round((doneCount / steps.length) * 100);
  const picks = progress.picks[step.id] ?? [];

  const goTo = (i: number) => update({ ...progress, current: steps[Math.min(steps.length - 1, Math.max(0, i))].id });

  const completeAndContinue = () => {
    const done = progress.done.includes(step.id) ? progress.done : [...progress.done, step.id];
    update({ ...progress, done, current: steps[Math.min(steps.length - 1, index + 1)].id });
  };

  const togglePick = (value: string) => {
    const next = picks.includes(value) ? picks.filter((v) => v !== value) : [...picks, value];
    update({ ...progress, picks: { ...progress.picks, [step.id]: next } });
  };

  return (
    // One screen tall on desktop (below the 64px header): nothing scrolls except the panel itself.
    <div className="md:h-[calc(100vh-64px)] md:overflow-hidden grid md:grid-cols-[340px_1fr]" style={{ background: "#fbf7f2" }}>
      {/* LEFT — where you are in the course */}
      <aside className="flex flex-col md:overflow-hidden border-b md:border-b-0 md:border-r" style={{ borderColor: LINE, background: "#f7efe3" }}>
        <div className="p-5 md:p-6">
          <Link href="/wedding-planning" className="inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: SOFT }}>
            <ChevronLeft size={14} /> All timelines
          </Link>
          <h1 className={`${displaySerif.className} mt-3 text-2xl md:text-3xl leading-tight`} style={{ color: INK }}>{plan.title}</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: GOLD }}>{plan.duration}</p>

          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: SOFT }}>
              <span>{doneCount} of {steps.length} steps done</span>
              <span className="font-bold" style={{ color: INK }}>{percent}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(43,24,7,0.1)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, background: INK }} />
            </div>
          </div>
        </div>

        <ol className="md:flex-1 md:overflow-y-auto px-3 pb-4 flex md:block gap-2 overflow-x-auto">
          {steps.map((s, i) => {
            const done = progress.done.includes(s.id);
            const active = i === index;
            return (
              <li key={s.id} className="shrink-0 md:shrink">
                <button
                  onClick={() => goTo(i)}
                  aria-current={active ? "step" : undefined}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer"
                  style={active ? { background: "#fff", boxShadow: "0 1px 4px rgba(43,24,7,0.08)" } : undefined}
                >
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={done ? { background: GOLD, color: "#fff" } : { border: `1.5px solid ${active ? INK : "rgba(43,24,7,0.3)"}`, color: active ? INK : SOFT }}
                  >
                    {done ? <Check size={14} /> : i + 1}
                  </span>
                  <span className="text-sm whitespace-nowrap md:whitespace-normal" style={{ color: active ? INK : SOFT, fontWeight: active ? 700 : 500 }}>
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* RIGHT — the current step */}
      <section className="flex flex-col md:overflow-hidden min-h-[70vh] md:min-h-0">
        <div key={step.id} className="flex-1 md:overflow-y-auto px-5 md:px-12 py-8 md:py-10">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
              Step {index + 1} of {steps.length}
              {step.kind === "checklist" && ` · ${step.period}`}
            </p>
            <h2 className={`${displaySerif.className} mt-2 text-3xl md:text-4xl leading-tight`} style={{ color: INK }}>{step.title}</h2>
            <p className="mt-3 text-sm md:text-base leading-relaxed" style={{ color: SOFT }}>{step.text}</p>

            {step.kind === "intro" && (
              <ul className="mt-6 space-y-2.5">
                {step.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 p-3.5 rounded-xl bg-white text-sm" style={{ border: `1px solid ${LINE}`, color: INK }}>
                    <Check size={16} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                    {point}
                  </li>
                ))}
              </ul>
            )}

            {step.kind === "video" && (
              <div className="mt-6">
                {step.videoUrl ? (
                  <iframe
                    src={step.videoUrl}
                    title={step.videoTitle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full aspect-video rounded-2xl"
                  />
                ) : (
                  // Placeholder until the lesson videos are recorded.
                  <div className="relative w-full aspect-video rounded-2xl flex flex-col items-center justify-center text-center px-6" style={{ background: INK }}>
                    <span className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#f7efe3", color: INK }}>
                      <Play size={26} className="ml-1" fill="currentColor" />
                    </span>
                    <p className={`${displaySerif.className} mt-4 text-xl`} style={{ color: "#f7efe3" }}>{step.videoTitle}</p>
                    <p className="mt-1 text-xs" style={{ color: "rgba(247,239,227,0.7)" }}>Video lesson coming soon</p>
                  </div>
                )}
              </div>
            )}

            {(step.kind === "choice" || step.kind === "checklist") && (
              <fieldset className="mt-6">
                <legend className="text-sm font-semibold" style={{ color: INK }}>
                  {step.kind === "choice" ? step.question : "Tick each activity when it is done"}
                </legend>
                <div className="mt-3 grid sm:grid-cols-2 gap-2.5">
                  {(step.kind === "choice" ? step.options : step.activities).map((option) => {
                    const checked = picks.includes(option);
                    return (
                      <label
                        key={option}
                        className="flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-colors text-sm"
                        style={checked ? { background: "#f3e9da", border: `1.5px solid ${INK}`, color: INK } : { background: "#fff", border: `1px solid ${LINE}`, color: INK }}
                      >
                        <input type="checkbox" checked={checked} onChange={() => togglePick(option)} className="sr-only" />
                        <span
                          className="mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center"
                          style={checked ? { background: INK, color: "#f7efe3" } : { border: "1.5px solid rgba(43,24,7,0.35)" }}
                        >
                          {checked && <Check size={13} />}
                        </span>
                        {option}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {step.kind === "finish" && (
              <div className="mt-6 rounded-2xl p-6 text-center" style={{ background: "#f3e9da" }}>
                <PartyPopper size={30} className="mx-auto" style={{ color: GOLD }} />
                <p className={`${displaySerif.className} mt-3 text-2xl`} style={{ color: INK }}>
                  {percent === 100 ? "Plan complete" : `${percent}% of your plan is done`}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link href="/collection" className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: INK, color: "#f7efe3" }}>
                    Browse decor and outfits
                  </Link>
                  <Link href="/vendors" className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ border: `1px solid ${INK}`, color: INK }}>
                    Find vendors
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step controls stay at the bottom of the screen */}
        <div className="shrink-0 px-5 md:px-12 py-4 border-t flex items-center justify-between gap-3" style={{ borderColor: LINE, background: "#fff" }}>
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            style={{ border: `1px solid ${INK}`, color: INK }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={completeAndContinue}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer"
            style={{ background: INK, color: "#f7efe3" }}
          >
            {progress.done.includes(step.id) ? (isLast ? "Completed" : "Continue") : isLast ? "Mark plan complete" : "Mark complete & continue"}
            {!isLast && <ArrowRight size={16} />}
          </button>
        </div>
      </section>
    </div>
  );
}
