"use client";

import { useState } from "react";
import { Check, Download, Plus, Send, X } from "lucide-react";
import { displaySerif } from "@/lib/fonts";
import { cldImage } from "@/lib/image";
import {
  CUSTOM_ITEM, MAX_ROWS, emptyEntry, hasPrices, money, sectionTotal, sheetTotal,
  type SectionKey, type SheetEntries, type SheetEntry, type SheetSection,
} from "@/lib/planning-sheet";

const INK = "var(--ink)";
const GOLD = "#835105";
const SOFT = "#57422C";
const LINE = "#e0c896";

const FIELD = "h-10 px-3 rounded-md text-sm bg-white outline-none focus:ring-2 focus:ring-[#835105]/30";

export default function SheetClient({
  sections,
  initialEntries,
  initialDate,
  customer,
  canSave,
  submitted,
}: {
  sections: SheetSection[];
  initialEntries: SheetEntries;
  initialDate: string;
  customer: { name: string; email: string };
  /** Only customer accounts keep a saved list and can send it (false for the admin). */
  canSave: boolean;
  /** The list was already sent to the business before. */
  submitted: boolean;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [weddingDate, setWeddingDate] = useState(initialDate);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "pdf">("idle");
  const [error, setError] = useState("");

  // Prices are written by the business; the customer only sees them.
  const priced = hasPrices(entries);

  const update = (key: SectionKey, change: (list: SheetEntry[]) => SheetEntry[]) => {
    setEntries((all) => ({ ...all, [key]: change(all[key]) }));
    if (state === "sent") setState("idle");
  };
  const patch = (key: SectionKey, id: string, change: (e: SheetEntry) => SheetEntry) =>
    update(key, (list) => list.map((e) => (e.id === id ? change(e) : e)));

  const save = async (submit: boolean) => {
    if (!canSave) return true;
    const res = await fetch("/api/planning-sheet", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries, weddingDate, submit }),
    });
    const json = await res.json().catch(() => null);
    if (!json?.success) setError(json?.message || "Could not save. Please try again.");
    return !!json?.success;
  };

  const handleSend = async () => {
    setError("");
    // The admin has no customer account, so there is nobody to attach the list to.
    if (!canSave) return setError("You are signed in as admin. Sign in with a customer account to send a list.");
    if (!sections.some((s) => entries[s.key].some((e) => (e.itemId === CUSTOM_ITEM ? e.label.trim() : e.itemId)))) return setError("Choose at least one person or item first.");
    setState("sending");
    setState((await save(true)) ? "sent" : "idle");
  };

  const handleDownload = async () => {
    setError("");
    setState("pdf");
    try {
      // The PDF is made from what is on screen, and the list is saved at the same time.
      const { downloadPlanningPdf } = await import("@/lib/planning-pdf");
      await Promise.all([save(false), downloadPlanningPdf({ sections, entries, customer, weddingDate: weddingDate || null })]);
    } catch {
      setError("Could not make the PDF. Please try again.");
    }
    setState("idle");
  };

  const busy = state === "sending" || state === "pdf";

  return (
    <div>
      {/* Wedding date on the left, the PDF button on the right */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <label className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold" style={{ color: INK }}>
          Wedding date
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => { setWeddingDate(e.target.value); if (state === "sent") setState("idle"); }}
            className="h-10 px-3 rounded-md text-sm bg-white font-normal"
            style={{ border: `1px solid ${LINE}`, color: INK }}
          />
        </label>
        <button
          onClick={handleDownload}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full text-sm font-semibold disabled:opacity-60 cursor-pointer"
          style={{ border: `1px solid ${INK}`, color: INK }}
        >
          <Download size={16} />
          {state === "pdf" ? "Preparing..." : "Download PDF"}
        </button>
      </div>

      <div className="space-y-8">
        {sections.map((section, index) => {
          const list = entries[section.key];
          return (
            <section key={section.key}>
              <h2 className={`${displaySerif.className} text-xl md:text-2xl pb-1.5 border-b-2`} style={{ color: INK, borderColor: GOLD }}>
                {index + 1}. {section.title}
              </h2>

              <div className="mt-2 rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
                {/* Column names: a real header row on larger screens; on phones they sit inside the fields */}
                <div className="hidden md:flex items-center gap-3 px-3 py-2.5 text-sm font-semibold" style={{ background: INK, color: "#fff" }}>
                  <span className="w-8 text-center">No</span>
                  <span className="flex-1">{section.rowsLabel}</span>
                  {section.columns.map((c) => (
                    <span key={c.id} className={c.short ? "w-24 text-center" : "flex-1"}>{c.label}</span>
                  ))}
                  {priced && <span className="w-28 text-right">Amafaranga</span>}
                  <span className="w-8" />
                </div>

                {list.map((entry, i) => {
                  const photo = section.rows.find((r) => r.id === entry.itemId)?.imageUrl;
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-wrap md:flex-nowrap items-center gap-x-3 gap-y-2 px-3 py-3 md:py-2"
                      style={{ borderTop: i ? `1px solid ${LINE}` : undefined, background: i % 2 ? "#fff" : "#fffcf4" }}
                    >
                      <span className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#faf2e0", color: INK }}>
                        {i + 1}
                      </span>

                      {/* Who / what: chosen from the list the business prepared, or written by the customer */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1 min-w-0">
                        {photo && <img src={cldImage(photo, 160)} alt="" loading="lazy" className="w-10 h-10 shrink-0 rounded-lg object-cover" />}
                        <select
                          value={entry.itemId}
                          onChange={(e) => {
                            const option = section.rows.find((r) => r.id === e.target.value);
                            patch(section.key, entry.id, (x) => ({ ...x, itemId: option?.id ?? (e.target.value === CUSTOM_ITEM ? CUSTOM_ITEM : ""), label: option?.label ?? "" }));
                          }}
                          aria-label={`${section.rowsLabel} ${i + 1}`}
                          className={`${FIELD} flex-1 min-w-0 cursor-pointer`}
                          style={{ border: `1px solid ${LINE}`, color: entry.itemId ? INK : SOFT }}
                        >
                          <option value="">{section.rowsLabel}...</option>
                          {/* A choice the business has since removed stays visible on this record. */}
                          {entry.itemId && entry.itemId !== CUSTOM_ITEM && !section.rows.some((r) => r.id === entry.itemId) && <option value={entry.itemId}>{entry.label}</option>}
                          {section.rows.map((r) => (
                            <option key={r.id} value={r.id}>{r.label}</option>
                          ))}
                          <option value={CUSTOM_ITEM}>+ Other (write your own)</option>
                        </select>
                        {entry.itemId === CUSTOM_ITEM && (
                          <input
                            value={entry.label}
                            onChange={(e) => patch(section.key, entry.id, (x) => ({ ...x, label: e.target.value }))}
                            maxLength={80}
                            autoFocus
                            placeholder="Write it here"
                            aria-label={`Your own ${section.rowsLabel} ${i + 1}`}
                            className={`${FIELD} flex-1 min-w-0 basis-full sm:basis-0`}
                            style={{ border: `1px solid ${GOLD}`, color: INK }}
                          />
                        )}
                      </div>

                      <button
                        onClick={() => update(section.key, (l) => (l.length > 1 ? l.filter((x) => x.id !== entry.id) : [emptyEntry()]))}
                        aria-label={`Remove record ${i + 1}`}
                        className="md:order-last w-8 h-8 shrink-0 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/5"
                        style={{ color: SOFT }}
                      >
                        <X size={16} />
                      </button>

                      {/* On phones, text fields go on their own line under the choice; a small number field stays beside it */}
                      {section.columns.some((c) => !c.short) && <span className="basis-full md:hidden" />}
                      {section.columns.map((c) => (
                        <input
                          key={c.id}
                          value={entry.cells[c.id] ?? ""}
                          onChange={(e) => patch(section.key, entry.id, (x) => ({ ...x, cells: { ...x.cells, [c.id]: e.target.value } }))}
                          inputMode={c.short ? "numeric" : undefined}
                          maxLength={200}
                          placeholder={c.label}
                          aria-label={`${c.label} ${i + 1}`}
                          className={`${FIELD} md:placeholder:text-transparent ${c.short ? "w-24 text-center" : "flex-1 min-w-0"}`}
                          style={{ border: `1px solid ${LINE}`, color: INK }}
                        />
                      ))}
                      {priced && (
                        <span className="w-full md:w-28 text-right text-sm font-semibold" style={{ color: INK }}>
                          {entry.amount !== null ? money(entry.amount) : ""}
                        </span>
                      )}
                    </div>
                  );
                })}

                {priced && (
                  <div className="flex items-center justify-between px-3 py-2.5 text-sm font-bold" style={{ borderTop: `1px solid ${LINE}`, background: "#faf2e0", color: INK }}>
                    <span>Total: {section.title}</span>
                    <span>{money(sectionTotal(list))}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => update(section.key, (l) => [...l, emptyEntry()])}
                disabled={list.length >= MAX_ROWS}
                className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold disabled:opacity-40 cursor-pointer"
                style={{ border: `1px dashed ${GOLD}`, color: GOLD }}
              >
                <Plus size={16} /> Add another
              </button>
            </section>
          );
        })}
      </div>

      {priced && (
        <p className={`${displaySerif.className} mt-8 text-right text-2xl`} style={{ color: INK }}>
          Total: {money(sheetTotal(entries))}
        </p>
      )}

      {/* The send button stays in reach while scrolling the list */}
      <div className="sticky bottom-20 md:bottom-4 z-10 mt-6 flex flex-wrap items-center gap-3 rounded-2xl p-3 shadow-lg" style={{ background: "#fff", border: `1px solid ${LINE}` }}>
        <button
          onClick={handleSend}
          disabled={busy}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full text-xs font-bold uppercase tracking-wider disabled:opacity-60 cursor-pointer"
          style={{ background: INK, color: "var(--cream)" }}
        >
          {state === "sent" ? <Check size={16} /> : <Send size={16} />}
          {state === "sending" ? "Sending..." : state === "sent" ? "Sent" : submitted ? "Send again" : "Send to Butterfly"}
        </button>
        {error && <p className="w-full sm:w-auto text-sm" style={{ color: "#991b1b" }}>{error}</p>}
        {state === "sent" && <p className="w-full sm:w-auto text-sm" style={{ color: "#166534" }}>We received your list. We will add the prices.</p>}
      </div>
    </div>
  );
}
