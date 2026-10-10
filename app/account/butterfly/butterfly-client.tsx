"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { cldImage } from "@/lib/image";

type Slide = { id: string; title: string; leftImageUrl: string; rightImageUrl: string };
type Side = "leftImageUrl" | "rightImageUrl";

const EMPTY_FORM = { title: "", leftImageUrl: "", rightImageUrl: "" };

export default function ButterflyClient({ slides, canImport }: { slides: Slide[]; canImport: boolean }) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [modal, setModal] = useState<{ open: boolean; editing: Slide | null }>({ open: false, editing: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState<Side | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // The server page owns the data: after a change we just ask it to render again.
  const reload = () => startTransition(() => router.refresh());

  const openAdd = () => { setForm(EMPTY_FORM); setError(""); setModal({ open: true, editing: null }); };
  const openEdit = (s: Slide) => {
    setForm({ title: s.title, leftImageUrl: s.leftImageUrl, rightImageUrl: s.rightImageUrl });
    setError("");
    setModal({ open: true, editing: s });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleUpload = async (side: Side, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(side);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "butterfly-home");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (json.success) setForm((f) => ({ ...f, [side]: json.data.url }));
    else setError(json.message ?? "Upload failed.");
    setUploading(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const res = await fetch(modal.editing ? `/api/butterfly-slides/${modal.editing.id}` : "/api/butterfly-slides", {
      method: modal.editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).message ?? "Could not save.");
      return;
    }
    closeModal();
    reload();
  };

  const handleDelete = async (slide: Slide) => {
    if (!confirm(`Delete the slide "${slide.title}"?`)) return;
    await fetch(`/api/butterfly-slides/${slide.id}`, { method: "DELETE" });
    reload();
  };

  const handleImport = async () => {
    setSaving(true);
    await fetch("/api/butterfly-slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ import: true }),
    });
    setSaving(false);
    reload();
  };

  const ready = form.title.trim() && form.leftImageUrl && form.rightImageUrl;

  const wingPicker = (side: Side, label: string) => (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label} *</label>
      <label className="relative block aspect-[2/3] rounded-lg border border-dashed border-border overflow-hidden cursor-pointer hover:bg-muted">
        {form[side] ? (
          <img src={cldImage(form[side], 400)} alt={label} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground px-2 text-center">
            {uploading === side ? "Uploading..." : "Click to choose"}
          </span>
        )}
        {form[side] && uploading === side && (
          <span className="absolute inset-0 flex items-center justify-center text-xs bg-black/50 text-white">Uploading...</span>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(side, e)} disabled={uploading !== null} />
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground max-w-xl">
          {slides.length} slide{slides.length === 1 ? "" : "s"} in the homepage butterfly animation. Each slide has a left and a
          right photo (the two wings) and a title shown under them. Tall photos work best.
        </p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      {canImport && (
        <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3" style={{ background: "var(--dash-soft)", borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--foreground)" }}>
            The animation used to take its photos from your collection categories. Copy them here to start with the same slides.
          </p>
          <button onClick={handleImport} disabled={saving} className="text-xs font-semibold px-4 py-2 rounded-full disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            {saving ? "Copying..." : "Copy photos from categories"}
          </button>
        </div>
      )}

      {slides.length === 0 ? (
        <p className="text-muted-foreground text-sm">No slides yet — the homepage shows no butterfly animation until you add one.</p>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${loading ? "opacity-60" : ""}`}>
          {slides.map((slide) => (
            <div key={slide.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex justify-center gap-1">
                <img src={cldImage(slide.leftImageUrl, 300)} alt={`${slide.title} (left)`} loading="lazy" className="w-24 h-36 object-cover rounded-md -rotate-2 shadow" />
                <img src={cldImage(slide.rightImageUrl, 300)} alt={`${slide.title} (right)`} loading="lazy" className="w-24 h-36 object-cover rounded-md rotate-2 shadow" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mt-3 text-center truncate">{slide.title}</h3>
              <div className="flex justify-center gap-2 mt-2">
                <button onClick={() => openEdit(slide)} aria-label="Edit" className="text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => handleDelete(slide)} aria-label="Delete" className="text-xs px-2.5 py-1.5 rounded-lg border dash-danger-btn">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{modal.editing ? "Edit Slide" : "Add Slide"}</h2>
              <button onClick={closeModal}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            {error && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: "var(--dash-danger-bg)", color: "var(--dash-danger)" }}>{error}</p>}
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={80}
              placeholder="Title * (shown under the wings)"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground"
            />
            <div className="grid grid-cols-2 gap-3">
              {wingPicker("leftImageUrl", "Left image")}
              {wingPicker("rightImageUrl", "Right image")}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground">Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading !== null || !ready} className="px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
