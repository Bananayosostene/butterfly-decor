"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { cldImage } from "@/lib/image";
import { MAX_COLUMNS, MAX_ROWS, newId, type SheetSection } from "@/lib/planning-sheet";

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

  const setColumn = (id: string, patch: Partial<SheetSection["columns"][number]>) =>
    change({ columns: section.columns.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
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
        This sets up the list on the Wedding Planning page. It has two parts. In each one the customer adds records
        one by one, choosing from the people and items you list here. Rename anything, then save each part.
      </p>

      <div className="flex items-center gap-1 border border-border rounded-lg p-1 w-fit">
        {drafts.map((s, i) => (
          <button
            key={s.key}
            onClick={() => { setActive(i); setSaved(false); setError(""); }}
            className="px-4 py-1.5 text-sm rounded-md font-medium"
            style={i === active ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}
          >
            {i + 1}. {s.title || "Untitled"}
          </button>
        ))}
      </div>

      {error && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: "var(--dash-danger-bg)", color: "var(--dash-danger)" }}>{error}</p>}

      {/* Names */}
      <div className="bg-card border border-border rounded-2xl p-5 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Title of this part</label>
          <input value={section.title} onChange={(e) => change({ title: e.target.value })} className={INPUT} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Name of the column where they choose (who / what)</label>
          <input value={section.rowsLabel} onChange={(e) => change({ rowsLabel: e.target.value })} className={INPUT} />
        </div>
      </div>

      {/* Columns */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Columns customers fill in</h2>
          <button
            onClick={() => change({ columns: [...section.columns, { id: newId(), label: "", short: false }] })}
            disabled={section.columns.length >= MAX_COLUMNS}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-foreground disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" /> Add column
          </button>
        </div>
        {section.columns.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <input value={c.label} onChange={(e) => setColumn(c.id, { label: e.target.value })} placeholder="Column name" className={INPUT} />
            <label className="shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer" title="A small column for a number, like Umubare">
              <input type="checkbox" checked={c.short} onChange={(e) => setColumn(c.id, { short: e.target.checked })} />
              Number
            </label>
            <button
              onClick={() => change({ columns: section.columns.filter((x) => x.id !== c.id) })}
              disabled={section.columns.length === 1}
              aria-label="Delete column"
              className="shrink-0 text-xs px-2.5 py-2 rounded-lg border dash-danger-btn disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">People and items to choose from ({section.rows.length})</h2>
          <button
            onClick={() => change({ rows: [...section.rows, { id: newId(), label: "", imageUrl: null }] })}
            disabled={section.rows.length >= MAX_ROWS}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-foreground disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <p className="text-xs text-muted-foreground">A photo is optional. It shows beside the record when the customer chooses this one.</p>
        {section.rows.map((r, i) => (
          <div key={r.id} className="flex items-center gap-2">
            <span className="shrink-0 w-6 text-xs font-semibold text-muted-foreground text-center">{i + 1}</span>
            {/* Photo: click to upload, × to remove */}
            <div className="relative shrink-0">
              <label className="w-10 h-10 rounded-lg border border-border flex items-center justify-center overflow-hidden cursor-pointer text-muted-foreground" title="Row photo">
                {r.imageUrl ? (
                  <img src={cldImage(r.imageUrl, 120)} alt="" className="w-full h-full object-cover" />
                ) : uploading === r.id ? (
                  <span className="text-[10px]">...</span>
                ) : (
                  <ImagePlus className="w-4 h-4" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(r.id, e)} />
              </label>
              {r.imageUrl && (
                <button
                  onClick={() => setRow(r.id, { imageUrl: null })}
                  aria-label="Remove photo"
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center bg-primary text-primary-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <input value={r.label} onChange={(e) => setRow(r.id, { label: e.target.value })} placeholder="Name (e.g. Umugeni)" className={INPUT} />
            <button onClick={() => moveRow(i, -1)} disabled={i === 0} aria-label="Move up" className="shrink-0 p-2 rounded-lg border border-border text-foreground disabled:opacity-30">
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => moveRow(i, 1)} disabled={i === section.rows.length - 1} aria-label="Move down" className="shrink-0 p-2 rounded-lg border border-border text-foreground disabled:opacity-30">
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => change({ rows: section.rows.filter((x) => x.id !== r.id) })}
              disabled={section.rows.length === 1}
              aria-label="Delete row"
              className="shrink-0 text-xs px-2.5 py-2 rounded-lg border dash-danger-btn disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
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
