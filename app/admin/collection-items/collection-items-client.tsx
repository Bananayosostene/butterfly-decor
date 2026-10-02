"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X, Table as TableIcon, LayoutGrid } from "lucide-react";
import Image from "next/image";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Pagination } from "@/components/pagination";
import { cldImage } from "@/lib/image";
import { stripHtmlToText } from "@/lib/text";

type Category = { id: string; name: string };
type Item = { id: string; name: string; description: string | null; imageUrl: string; categoryId: string; category: Category };

export default function CollectionItemsClient({
  items,
  categories,
  filterCat,
  page,
  totalPages,
  total,
}: {
  items: Item[];
  categories: Category[];
  filterCat: string;
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [view, setView] = useState<"table" | "cards">("table");
  const [modal, setModal] = useState<{ open: boolean; editing: Item | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "", categoryId: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // The server page owns the data: changing page/filter or saving just asks it to render again.
  const load = (pageNum: number, categoryId = filterCat) => {
    startTransition(() => {
      if (pageNum === page && categoryId === filterCat) return router.refresh();
      const params = new URLSearchParams({ page: String(pageNum) });
      if (categoryId) params.set("cat", categoryId);
      router.push(`/admin/collection-items?${params.toString()}`);
    });
  };

  const setPage = (p: number) => load(p);
  const handleFilterChange = (categoryId: string) => load(1, categoryId);

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
    load(modal.editing ? page : 1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/collection-items/${id}`, { method: "DELETE" });
    const isLastRowOnPage = items.length === 1 && page > 1;
    load(isLastRowOnPage ? page - 1 : page);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select value={filterCat} onChange={(e) => handleFilterChange(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <p className="text-sm text-muted-foreground">{total} item{total === 1 ? "" : "s"}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("table")}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors"
              style={view === "table" ? { background: "#2b1807", color: "#e8d5b7" } : { color: "var(--muted-foreground)" }}
            >
              <TableIcon className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => setView("cards")}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-l border-border"
              style={view === "cards" ? { background: "#2b1807", color: "#e8d5b7" } : { color: "var(--muted-foreground)" }}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#2b1807", color: "#e8d5b7" }}>
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No items yet.</p>
      ) : view === "table" ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Image</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Category</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Description</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <Image src={cldImage(item.imageUrl, 96)} alt={item.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{item.category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{item.description ? stripHtmlToText(item.description) : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="relative h-36 w-full">
                <Image src={cldImage(item.imageUrl, 500)} alt={item.name} fill className="object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-muted-foreground">{item.category.name}</p>
                <h3 className="font-semibold text-foreground text-sm mt-0.5 truncate">{item.name}</h3>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{stripHtmlToText(item.description)}</p>
                )}
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

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{modal.editing ? "Edit Item" : "Add Item"}</h2>
              <button onClick={closeModal}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name *" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground" />
              <RichTextEditor value={form.description} onChange={(html) => setForm((f) => ({ ...f, description: html }))} placeholder="Description" />
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
