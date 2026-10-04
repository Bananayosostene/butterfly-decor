"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { CATEGORY_ICONS, iconForCategory } from "@/lib/category-icons";

type VendorCategory = { id: string; name: string; icon: string | null; vendors: number };

export default function VendorCategoriesClient({ categories }: { categories: VendorCategory[] }) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [modal, setModal] = useState<{ open: boolean; editing: VendorCategory | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ name: "", icon: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // The server page owns the data: after a change we just ask it to render again.
  const reload = () => startTransition(() => router.refresh());

  const openAdd = () => { setForm({ name: "", icon: "" }); setError(""); setModal({ open: true, editing: null }); };
  const openEdit = (c: VendorCategory) => { setForm({ name: c.name, icon: c.icon ?? "" }); setError(""); setModal({ open: true, editing: c }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch(modal.editing ? `/api/vendor-categories/${modal.editing.id}` : "/api/vendor-categories", {
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

  const handleDelete = async (c: VendorCategory) => {
    if (!confirm(`Delete the vendor category "${c.name}"?`)) return;
    const res = await fetch(`/api/vendor-categories/${c.id}`, { method: "DELETE" });
    if (!res.ok) alert((await res.json().catch(() => ({}))).message ?? "Could not delete.");
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {categories.length} vendor categor{categories.length === 1 ? "y" : "ies"} — vendors pick one of these when they sign up.
        </p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#2b1807", color: "#e8d5b7" }}>
          <Plus className="w-4 h-4" /> Add Vendor Category
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">No vendor categories yet. Add one so vendors can sign up.</p>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Category</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Vendors</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <img src={`/${iconForCategory(c.name, c.icon)}`} alt="" className="w-7 h-7 object-contain rounded-full border border-border" />
                      {c.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.vendors}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} aria-label="Edit" className="text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(c)} aria-label="Delete" className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{modal.editing ? "Edit Vendor Category" : "Add Vendor Category"}</h2>
              <button onClick={closeModal}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            {error && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: "#fde8e8", color: "#991b1b" }}>{error}</p>}
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Name * (e.g. Photographers, Venues, Catering)"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground"
            />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Icon</label>
              <div className="grid grid-cols-6 gap-2">
                {CATEGORY_ICONS.map((ic) => {
                  const selected = form.icon === ic.file;
                  return (
                    <button
                      key={ic.file}
                      type="button"
                      title={ic.label}
                      aria-label={ic.label}
                      aria-pressed={selected}
                      onClick={() => setForm((f) => ({ ...f, icon: selected ? "" : ic.file }))}
                      className="aspect-square rounded-full flex items-center justify-center transition-all"
                      style={{ border: selected ? "2px solid #2b1807" : "1px solid var(--border)", background: selected ? "#fdf6ee" : "transparent" }}
                    >
                      <img src={`/${ic.file}`} alt="" className="w-3/4 h-3/4 object-contain" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-border text-foreground">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()} className="px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50" style={{ background: "#2b1807", color: "#e8d5b7" }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
