"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import Image from "next/image";

type StyleIdea = { id: string; title: string; description?: string; imageUrl: string; tags: string[] };

export default function StyleIdeasPage() {
  const [ideas, setIdeas] = useState<StyleIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: StyleIdea | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "", tags: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/style-ideas");
    const json = await res.json();
    setIdeas(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ title: "", description: "", imageUrl: "", tags: "" }); setModal({ open: true, editing: null }); };
  const openEdit = (idea: StyleIdea) => { setForm({ title: idea.title, description: idea.description ?? "", imageUrl: idea.imageUrl, tags: idea.tags.join(", ") }); setModal({ open: true, editing: idea }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "butterfly-style-ideas");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.success) setForm((f) => ({ ...f, imageUrl: json.data.url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.imageUrl) return;
    setSaving(true);
    const payload = { title: form.title, description: form.description, imageUrl: form.imageUrl, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    if (modal.editing) {
      await fetch(`/api/style-ideas/${modal.editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/style-ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setSaving(false);
    closeModal();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this style idea?")) return;
    await fetch(`/api/style-ideas/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{ideas.length} style ideas</p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#2b1807", color: "#e8d5b7" }}>
          <Plus className="w-4 h-4" /> Add Style Idea
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : ideas.length === 0 ? (
        <p className="text-muted-foreground text-sm">No style ideas yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="relative h-40 w-full">
                <Image src={idea.imageUrl} alt={idea.title} fill className="object-cover" />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-foreground text-sm truncate">{idea.title}</h3>
                {idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {idea.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => openEdit(idea)} className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-border text-foreground hover:bg-muted">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDelete(idea.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">
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
              <h2 className="font-semibold text-foreground">{modal.editing ? "Edit Style Idea" : "Add Style Idea"}</h2>
              <button onClick={closeModal}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title *" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground" />
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground resize-none" />
              <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="Tags (comma separated)" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground" />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Image *</label>
                <input type="file" accept="image/*" onChange={handleUpload} className="text-sm text-muted-foreground" />
                {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
                {form.imageUrl && <img src={form.imageUrl} alt="preview" className="mt-2 h-24 w-full object-cover rounded-lg" />}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground">Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading} className="px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50" style={{ background: "#2b1807", color: "#e8d5b7" }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
