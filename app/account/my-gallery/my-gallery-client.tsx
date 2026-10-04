"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X, ExternalLink } from "lucide-react";
import { cldImage } from "@/lib/image";

type Item = { id: string; imageUrl: string; description: string | null; active: boolean };

export default function MyGalleryClient({ items, vendorId }: { items: Item[]; vendorId: string }) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [modal, setModal] = useState<{ open: boolean; editing: Item | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ imageUrl: "", description: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // The server page owns the data: after a change we just ask it to render again.
  const reload = () => startTransition(() => router.refresh());

  const openAdd = () => { setForm({ imageUrl: "", description: "" }); setError(""); setModal({ open: true, editing: null }); };
  const openEdit = (item: Item) => { setForm({ imageUrl: item.imageUrl, description: item.description ?? "" }); setError(""); setModal({ open: true, editing: item }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "butterfly-vendors");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (json.success) setForm((f) => ({ ...f, imageUrl: json.data.url }));
    else setError(json.message ?? "Upload failed.");
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.imageUrl) return;
    setSaving(true);
    setError("");
    const res = await fetch(modal.editing ? `/api/vendor/items/${modal.editing.id}` : "/api/vendor/items", {
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

  const handleDelete = async (item: Item) => {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/vendor/items/${item.id}`, { method: "DELETE" });
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {items.length} photo{items.length === 1 ? "" : "s"} in your gallery.{" "}
          <Link href={`/vendors/${vendorId}`} target="_blank" className="inline-flex items-center gap-1 underline">
            View my public page <ExternalLink className="w-3 h-3" />
          </Link>
        </p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#2b1807", color: "#e8d5b7" }}>
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">Your gallery is empty. Add photos of your work so couples can find you.</p>
      ) : (
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ${loading ? "opacity-60" : ""}`}>
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={cldImage(item.imageUrl, 500)}
                  alt={item.description ?? "Gallery photo"}
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover ${item.active ? "" : "opacity-40 grayscale"}`}
                />
                {!item.active && (
                  <span className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#fee2e2", color: "#991b1b" }}>
                    Hidden by admin
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-8">{item.description || "No description"}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => openEdit(item)} aria-label="Edit" className="text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDelete(item)} aria-label="Delete" className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{modal.editing ? "Edit Photo" : "Add Photo"}</h2>
              <button onClick={closeModal}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            {error && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: "#fde8e8", color: "#991b1b" }}>{error}</p>}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Image * (max 10MB)</label>
              <input type="file" accept="image/*" onChange={handleUpload} className="text-sm text-muted-foreground" />
              {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
              {form.imageUrl && <img src={cldImage(form.imageUrl, 600)} alt="preview" className="mt-2 h-40 w-full object-cover rounded-lg" />}
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              maxLength={500}
              rows={3}
              placeholder="Description (what is shown, where, for which event…)"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground">Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading || !form.imageUrl} className="px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50" style={{ background: "#2b1807", color: "#e8d5b7" }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
