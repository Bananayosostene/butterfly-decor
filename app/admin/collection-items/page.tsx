"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import Image from "next/image";

type Category = { id: string; name: string };
type Item = { id: string; name: string; description?: string; imageUrl: string; categoryId: string; category: Category };

export default function CollectionItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCat, setFilterCat] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Item | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "", categoryId: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [itemsRes, catsRes] = await Promise.all([
      fetch(`/api/collection-items${filterCat ? `?categoryId=${filterCat}` : ""}`),
      fetch("/api/categories"),
    ]);
    const [itemsJson, catsJson] = await Promise.all([itemsRes.json(), catsRes.json()]);
    setItems(itemsJson.data ?? []);
    setCategories(catsJson.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterCat]);

  const openAdd = () => { setForm({ name: "", description: "", imageUrl: "", categoryId: categories[0]?.id ?? "" }); setModal({ open: true, editing: null }); };
  const openEdit = (item: Item) => { setForm({ name: item.name, description: item.description ?? "", imageUrl: item.imageUrl, categoryId: item.categoryId }); setModal({ open: true, editing: item }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "butterfly-collection");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.success) setForm((f) => ({ ...f, imageUrl: json.data.url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.imageUrl || !form.categoryId) return;
    setSaving(true);
    if (modal.editing) {
      await fetch(`/api/collection-items/${modal.editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch("/api/collection-items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setSaving(false);
    closeModal();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/collection-items/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <p className="text-sm text-muted-foreground">{items.length} items</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#2b1807", color: "#e8d5b7" }}>
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No items yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="relative h-36 w-full">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-muted-foreground">{item.category.name}</p>
                <h3 className="font-semibold text-foreground text-sm mt-0.5 truncate">{item.name}</h3>
                {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => openEdit(item)} className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-border text-foreground hover:bg-muted">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">
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
              <h2 className="font-semibold text-foreground">{modal.editing ? "Edit Item" : "Add Item"}</h2>
              <button onClick={closeModal}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name *" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground" />
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground resize-none" />
              <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
                <option value="">Select Category *</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
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
