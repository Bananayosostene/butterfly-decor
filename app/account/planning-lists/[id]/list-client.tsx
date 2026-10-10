"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Download, Plus, Trash2 } from "lucide-react";
import {
  CUSTOM_ITEM, MAX_ROWS, emptyEntry, money, sectionTotal, sheetTotal,
  type SectionKey, type SheetEntries, type SheetEntry, type SheetSection,
} from "@/lib/planning-sheet";

const INPUT = "h-9 px-3 border border-border rounded-lg text-sm bg-background text-foreground";

export default function ListClient({
  id,
  sections,
  initialEntries,
  initialDate,
  customer,
}: {
  id: string;
  sections: SheetSection[];
  initialEntries: SheetEntries;
  initialDate: string;
  customer: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [entries, setEntries] = useState(initialEntries);
  const [weddingDate, setWeddingDate] = useState(initialDate);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "pdf">("idle");
  const [error, setError] = useState("");

  const update = (key: SectionKey, change: (list: SheetEntry[]) => SheetEntry[]) => {
    setEntries((all) => ({ ...all, [key]: change(all[key]) }));
    setState("idle");
  };
  const patch = (key: SectionKey, entryId: string, change: (e: SheetEntry) => SheetEntry) =>
    update(key, (list) => list.map((e) => (e.id === entryId ? change(e) : e)));

  const handleSave = async () => {
    setError("");
    setState("saving");
    const res = await fetch(`/api/planning-sheet/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries, weddingDate }),
    });
    const json = await res.json().catch(() => null);
    if (!json?.success) {
      setError(json?.message || "Could not save");
      return setState("idle");
    }
    setState("saved");
    startTransition(() => router.refresh());
  };

  const handleDownload = async () => {
    setError("");
    setState("pdf");
    try {
      const { downloadPlanningPdf } = await import("@/lib/planning-pdf");
      await downloadPlanningPdf({ sections, entries, customer, weddingDate: weddingDate || null });
    } catch {
      setError("Could not make the PDF");
    }
    setState("idle");
  };

  const busy = state === "saving" || state === "pdf";

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/account/planning-lists" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> All customer lists
      </Link>

      {/* Customer */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-foreground">{customer.name}</p>
          <p className="text-sm text-muted-foreground">{[customer.phone, customer.email].filter(Boolean).join(" · ")}</p>
        </div>
        <label className="text-xs text-muted-foreground">
          <span className="block mb-1">Wedding date</span>
          <input type="date" value={weddingDate} onChange={(e) => { setWeddingDate(e.target.value); setState("idle"); }} className={INPUT} />
        </label>
      </div>

      {error && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: "var(--dash-danger-bg)", color: "var(--dash-danger)" }}>{error}</p>}

      {sections.map((section, index) => {
        const list = entries[section.key];
        return (
          <div key={section.key} className="bg-card border border-border rounded-2xl overflow-hidden">
            <h2 className="px-5 py-4 text-sm font-semibold text-foreground">{index + 1}. {section.title}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-3 py-2.5 text-muted-foreground font-medium w-10">No</th>
                    <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">{section.rowsLabel}</th>
                    {section.columns.map((c) => (
                      <th key={c.id} className="text-left px-3 py-2.5 text-muted-foreground font-medium">{c.label}</th>
                    ))}
                    <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Amount (RWF)</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((entry, i) => (
                    <tr key={entry.id} className="border-t border-border">
                      <td className="px-3 py-2 text-muted-foreground font-semibold">{i + 1}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={entry.itemId}
                            onChange={(e) => {
                              const option = section.rows.find((r) => r.id === e.target.value);
                              patch(section.key, entry.id, (x) => ({ ...x, itemId: option?.id ?? (e.target.value === CUSTOM_ITEM ? CUSTOM_ITEM : ""), label: option?.label ?? "" }));
                            }}
                            className={`${INPUT} flex-1 min-w-40`}
                          >
                            <option value="">Choose...</option>
                            {entry.itemId && entry.itemId !== CUSTOM_ITEM && !section.rows.some((r) => r.id === entry.itemId) && <option value={entry.itemId}>{entry.label}</option>}
                            {section.rows.map((r) => (
                              <option key={r.id} value={r.id}>{r.label}</option>
                            ))}
                            <option value={CUSTOM_ITEM}>+ Other (not on the list)</option>
                          </select>
                          {/* Written by the customer (or by you) instead of chosen from the list */}
                          {entry.itemId === CUSTOM_ITEM && (
                            <input
                              value={entry.label}
                              onChange={(e) => patch(section.key, entry.id, (x) => ({ ...x, label: e.target.value }))}
                              maxLength={80}
                              placeholder="Write it here"
                              className={`${INPUT} flex-1 min-w-40`}
                            />
                          )}
                        </div>
                      </td>
                      {section.columns.map((c) => (
                        <td key={c.id} className="px-3 py-2">
                          <input
                            value={entry.cells[c.id] ?? ""}
                            onChange={(e) => patch(section.key, entry.id, (x) => ({ ...x, cells: { ...x.cells, [c.id]: e.target.value } }))}
                            maxLength={200}
                            className={`${INPUT} ${c.short ? "w-20 text-center" : "w-full min-w-40"}`}
                          />
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          step={500}
                          value={entry.amount ?? ""}
                          onChange={(e) => {
                            const n = e.target.value === "" ? null : Math.max(0, Math.round(Number(e.target.value)));
                            patch(section.key, entry.id, (x) => ({ ...x, amount: n !== null && Number.isFinite(n) ? n : null }));
                          }}
                          placeholder="0"
                          aria-label={`Amount for record ${i + 1}`}
                          className={`${INPUT} w-32 text-right`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => update(section.key, (l) => (l.length > 1 ? l.filter((x) => x.id !== entry.id) : [emptyEntry()]))}
                          aria-label={`Delete record ${i + 1}`}
                          className="p-2 rounded-lg border dash-danger-btn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/50">
                    <td colSpan={section.columns.length + 2} className="px-3 py-3">
                      <button
                        onClick={() => update(section.key, (l) => [...l, emptyEntry()])}
                        disabled={list.length >= MAX_ROWS}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-foreground disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add record
                      </button>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-foreground whitespace-nowrap">{money(sectionTotal(list))}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })}

      {/* Grand total and actions */}
      <div className="sticky bottom-4 bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="text-2xl font-bold" style={{ color: "var(--dash-accent)" }}>{money(sheetTotal(entries))}</p>
        </div>
        <div className="flex items-center gap-2">
          {state === "saved" && <span className="flex items-center gap-1 text-xs dash-ok-text"><Check className="w-3.5 h-3.5" /> Saved</span>}
          <button onClick={handleDownload} disabled={busy} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-border text-foreground disabled:opacity-50">
            <Download className="w-4 h-4" /> {state === "pdf" ? "Preparing..." : "PDF"}
          </button>
          <button
            onClick={handleSave}
            disabled={busy}
            className="px-5 py-2 text-sm rounded-lg font-medium disabled:opacity-50"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {state === "saving" ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
