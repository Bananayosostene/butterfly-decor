"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { cldImage } from "@/lib/image";
import { MAX_ROWS, newId, type SheetSection } from "@/lib/planning-sheet";

const INPUT = "w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground";

export default function PlanningSheetClient({ sections }: { sections: SheetSection[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [drafts, setDrafts] = useState(sections);
  const [active, setActive] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const section = drafts[active];

  const change = (patch: Partial<SheetSection>) => {
    setSaved(false);
    setDrafts((all) => all.map((s, i) => (i === active ? { ...s, ...patch } : s)));
  };

  const setRow = (id: string, patch: Partial<SheetSection["rows"][number]>) =>
    change({ rows: section.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  const moveRow = (index: number, by: number) => {
    const rows = [...section.rows];
    const target = index + by;
    if (target < 0 || target >= rows.length) return;
    [rows[index], rows[target]] = [rows[target], rows[index]];
    change({ rows });
  };

  const handleUpload = async (rowId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(rowId);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "butterfly-planning");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.success) setRow(rowId, { imageUrl: json.data.url });
    else setError(json.message || "Upload failed");
    setUploading(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/planning-sections/${section.key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(section),
    });
    const json = await res.json().catch(() => null);
    setSaving(false);
    if (!json?.success) return setError(json?.message || "Could not save");
    setSaved(true);
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <p className="text-sm text-muted-foreground">
        Add the people and items customers can choose from. The two columns — People / Item and Number — are fixed.
      </p>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 border border-border rounded-lg p-1 w-fit">
        {drafts.map((s, i) => (
          <button
            key={s.key}
            onClick={() => { setActive(i); setSaved(false); setError(""); }}
            className="px-4 py-1.5 text-sm rounded-md font-medium transition-colors"
            style={i === active ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}
          >
            {s.title}
          </button>
        ))}
      </div>

      {error && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: "var(--dash-danger-bg)", color: "var(--dash-danger)" }}>{error}</p>}

      {/* Section title */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <label className="text-xs text-muted-foreground mb-1 block">Section title</label>
        <input value={section.title} onChange={(e) => change({ title: e.target.value })} className={INPUT} />
      </div>

      {/* Items table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Fixed column headers */}
        <div className="grid grid-cols-[2rem_2.5rem_1fr_6rem_5rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>#</span>
          <span>Photo</span>
          <span>People / Item</span>
          <span className="text-center">Number</span>
          <span />
        </div>

        {section.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            No items yet — click <strong>Add item</strong> below to start.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {section.rows.map((r, i) => (
              <div key={r.id} className="grid grid-cols-[2rem_2.5rem_1fr_6rem_5rem] gap-3 items-center px-4 py-2.5">
                <span className="text-xs font-semibold text-muted-foreground">{i + 1}</span>

                {/* Photo */}
                <div className="relative">
                  <label className="w-9 h-9 rounded-lg border border-border flex items-center justify-center overflow-hidden cursor-pointer text-muted-foreground">
                    {r.imageUrl ? (
                      <img src={cldImage(r.imageUrl, 80)} alt="" className="w-full h-full object-cover" />
                    ) : uploading === r.id ? (
                      <span className="text-[10px]">...</span>
                    ) : (
                      <ImagePlus className="w-3.5 h-3.5" />
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(r.id, e)} />
                  </label>
                  {r.imageUrl && (
                    <button
                      onClick={() => setRow(r.id, { imageUrl: null })}
                      aria-label="Remove photo"
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center bg-primary text-primary-foreground"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                {/* Name — this is the "People / Item" column value */}
                <input
                  value={r.label}
                  onChange={(e) => setRow(r.id, { label: e.target.value })}
                  placeholder="e.g. Umugeni (Bridal)"
                  className={INPUT}
                />

                {/* Number column — read-only label showing it's filled by the customer */}
                <span className="text-xs text-muted-foreground text-center italic">by customer</span>

                {/* Row actions */}
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => moveRow(i, -1)} disabled={i === 0} aria-label="Move up" className="p-1.5 rounded border border-border text-foreground disabled:opacity-30">
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => moveRow(i, 1)} disabled={i === section.rows.length - 1} aria-label="Move down" className="p-1.5 rounded border border-border text-foreground disabled:opacity-30">
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => change({ rows: section.rows.filter((x) => x.id !== r.id) })}
                    aria-label="Delete"
                    className="p-1.5 rounded border dash-danger-btn"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add row */}
        <div className="px-4 py-3 border-t border-border">
          <button
            onClick={() => change({ rows: [...section.rows, { id: newId(), label: "", imageUrl: null }] })}
            disabled={section.rows.length >= MAX_ROWS}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-border text-foreground disabled:opacity-40 hover:bg-muted transition-colors"
          >
            <Plus className="w-4 h-4" /> Add item
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || uploading !== null}
          className="px-5 py-2 text-sm rounded-lg font-medium disabled:opacity-50"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {saving ? "Saving..." : `Save "${section.title}"`}
        </button>
        {saved && <span className="flex items-center gap-1 text-xs dash-ok-text"><Check className="w-3.5 h-3.5" /> Saved</span>}
      </div>
    </div>
  );
}
