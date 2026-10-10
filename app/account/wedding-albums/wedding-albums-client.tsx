"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, ImagePlus, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { cldImage } from "@/lib/image";

type Album = { id: string; title: string; weddingDate: string | null; images: string[] };

const MAX_IMAGES = 20;
/** Photos sent to storage at the same time. */
const PARALLEL_UPLOADS = 3;

const EMPTY = { title: "", weddingDate: "", images: [] as string[] };

export default function WeddingAlbumsClient({ albums }: { albums: Album[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [modal, setModal] = useState<{ open: boolean; editing: Album | null }>({ open: false, editing: null });
  const [form, setForm] = useState(EMPTY);
  const [pending, setPending] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // The server page owns the data: after a save we just ask it to render again.
  const reload = () => startTransition(() => router.refresh());

  const openAdd = () => { setForm(EMPTY); setError(""); setModal({ open: true, editing: null }); };
  const openEdit = (a: Album) => { setForm({ title: a.title, weddingDate: a.weddingDate ?? "", images: a.images }); setError(""); setModal({ open: true, editing: a }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const uploadOne = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "butterfly-wedding-albums");
    try {
      const json = await (await fetch("/api/upload", { method: "POST", body: fd })).json();
      if (json.success) setForm((f) => (f.images.length < MAX_IMAGES ? { ...f, images: [...f.images, json.data.url] } : f));
      else setError(json.message || `Could not upload ${file.name}`);
    } catch {
      setError(`Could not upload ${file.name}`);
    }
    setPending((n) => n - 1);
  };

  /** Many photos can be chosen at once; only as many as still fit in the album are taken. */
  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(e.target.files ?? []);
    e.target.value = "";
    const room = MAX_IMAGES - form.images.length - pending;
    const files = chosen.slice(0, Math.max(0, room));
    setError(chosen.length > files.length ? `An album holds ${MAX_IMAGES} photos: only the first ${files.length} were added.` : "");
    if (!files.length) return;

    setPending((n) => n + files.length);
    const queue = [...files];
    await Promise.all(
      Array.from({ length: PARALLEL_UPLOADS }, async () => {
        for (let file = queue.shift(); file; file = queue.shift()) await uploadOne(file);
      }),
    );
  };

  const removeImage = (url: string) => setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }));
  const makeCover = (url: string) => setForm((f) => ({ ...f, images: [url, ...f.images.filter((u) => u !== url)] }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const res = await fetch(modal.editing ? `/api/wedding-albums/${modal.editing.id}` : "/api/wedding-albums", {
      method: modal.editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json().catch(() => null);
    setSaving(false);
    if (!json?.success) return setError(json?.message || "Could not save the album");
    closeModal();
    reload();
  };

  const handleDelete = async (album: Album) => {
    if (!confirm(`Delete the album "${album.title}" and its ${album.images.length} photos?`)) return;
    await fetch(`/api/wedding-albums/${album.id}`, { method: "DELETE" });
    reload();
  };

  const ready = form.title.trim() && form.images.length > 0 && pending === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {albums.length} album{albums.length !== 1 ? "s" : ""}. One album is one couple, with up to {MAX_IMAGES} photos. The newest show on the homepage.
        </p>
        <button onClick={openAdd} className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          <Plus className="w-4 h-4" /> Add Album
        </button>
      </div>

      {albums.length === 0 ? (
        <p className="text-muted-foreground text-sm">No albums yet. Add the first one with photos of a couple you served.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {albums.map((album) => (
            <div key={album.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {album.images[0] && <img src={cldImage(album.images[0], 500)} alt={album.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
                <span className="absolute bottom-2 right-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white">
                  {album.images.length} photo{album.images.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-foreground truncate">{album.title}</p>
                <p className="text-xs text-muted-foreground">{album.weddingDate ? album.weddingDate.split("-").reverse().join("/") : "No date"}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => openEdit(album)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <a href={`/wedding-albums/${album.id}`} target="_blank" className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">
                    <ExternalLink className="w-3 h-3" /> View
                  </a>
                  <button onClick={() => handleDelete(album)} aria-label="Delete" className="ml-auto text-xs px-2.5 py-1.5 rounded-lg border dash-danger-btn">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl max-h-full overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{modal.editing ? "Edit Album" : "Add Album"}</h2>
              <button onClick={closeModal} aria-label="Close"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            {error && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: "var(--dash-danger-bg)", color: "var(--dash-danger)" }}>{error}</p>}

            <div className="grid sm:grid-cols-[1fr_auto] gap-3">
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Couple * (e.g. Aline & Eric)"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground"
              />
              <input
                type="date"
                value={form.weddingDate}
                onChange={(e) => setForm((f) => ({ ...f, weddingDate: e.target.value }))}
                aria-label="Wedding date"
                className="px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted-foreground">
                  Photos ({form.images.length}/{MAX_IMAGES}){pending > 0 && ` · uploading ${pending}...`}
                </label>
                <span className="text-xs text-muted-foreground">The first photo is the cover</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {form.images.map((url, i) => (
                  <div key={url} className="group relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={cldImage(url, 300)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    {i === 0 ? (
                      <span className="absolute top-1 left-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">Cover</span>
                    ) : (
                      <button
                        onClick={() => makeCover(url)}
                        title="Use as cover"
                        aria-label="Use as cover"
                        className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center bg-black/60 text-white"
                      >
                        <Star className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(url)}
                      title="Remove photo"
                      aria-label="Remove photo"
                      className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center bg-black/60 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {Array.from({ length: pending }).map((_, i) => (
                  <div key={`pending-${i}`} className="aspect-square rounded-lg bg-muted animate-pulse" />
                ))}
                {form.images.length + pending < MAX_IMAGES && (
                  <label className="aspect-square rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground cursor-pointer hover:bg-muted text-center px-1">
                    <ImagePlus className="w-5 h-5" />
                    Add photos
                    {/* Several photos can be picked in one go */}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground">Cancel</button>
              <button onClick={handleSave} disabled={saving || !ready} className="px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                {saving ? "Saving..." : pending > 0 ? "Uploading..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
