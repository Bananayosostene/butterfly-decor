"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import Image from "next/image";

type Category = { id: string; name: string; description?: string; imageUrl?: string };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const json = await res.json();
    setCategories(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ name: "", description: "", imageUrl: "" }); setModal({ open: true, editing: null }); };
  const openEdit = (c: Category) => { setForm({ name: c.name, description: c.description ?? "", imageUrl: c.imageUrl ?? "" }); setModal({ open: true, editing: c }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "butterfly-categories");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.success) setForm((f) => ({ ...f, imageUrl: json.data.url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (modal.editing) {
      await fetch(`/api/categories/${modal.editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setSaving(false);
    closeModal();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#2b1807", color: "#e8d5b7" }}>
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden">
              {c.imageUrl && (
                <div className="relative h-40 w-full">
                  <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{c.name}</h3>
                {c.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(c)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{modal.editing ? "Edit Category" : "Add Category"}</h2>
              <button onClick={closeModal}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name *" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground" />
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" rows={3} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground resize-none" />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Image</label>
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
