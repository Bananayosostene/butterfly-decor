"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X, Images, Table as TableIcon, LayoutGrid } from "lucide-react";
import Image from "next/image";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { CategoryImagesManager } from "@/components/admin/category-images-manager";
import { Pagination } from "@/components/pagination";
import { cldImage } from "@/lib/image";
import { stripHtmlToText } from "@/lib/text";
import Link from "next/link";
import { CATEGORY_ICONS, iconForCategory, type CategoryKind } from "@/lib/category-icons";

type CategoryImage = { id: string; imageUrl: string; order: number };
type Category = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  kind: string | null;
  icon: string | null;
  images: CategoryImage[];
};

const EMPTY_FORM = { name: "", description: "", imageUrl: "", icon: "", kind: "COLLECTION" as CategoryKind };

export default function CategoriesClient({
  categories,
  kind,
  page,
  totalPages,
  total,
}: {
  categories: Category[];
  /** Which tab is open: main collection categories or decor categories. */
  kind: CategoryKind;
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [view, setView] = useState<"table" | "cards">("table");
  const [modal, setModal] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagesManagerFor, setImagesManagerFor] = useState<Category | null>(null);

  // The server page owns the data: changing page or saving just asks it to render again.
  const load = (pageNum: number) => {
    startTransition(() => {
      if (pageNum === page) router.refresh();
      else router.push(`/admin/categories?page=${pageNum}${kind === "DECOR" ? "&kind=decor" : ""}`);
    });
  };

  const goToPage = (p: number) => load(p);

  const openAdd = () => { setForm({ ...EMPTY_FORM, kind }); setModal({ open: true, editing: null }); };
  const openEdit = (c: Category) => {
    setForm({
      name: c.name,
      description: c.description ?? "",
      imageUrl: c.imageUrl ?? "",
      icon: c.icon ?? "",
      kind: c.kind === "DECOR" ? "DECOR" : "COLLECTION",
    });
    setModal({ open: true, editing: c });
  };
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
    load(modal.editing ? page : 1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const isLastRowOnPage = categories.length === 1 && page > 1;
    load(isLastRowOnPage ? page - 1 : page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 p-1 rounded-lg border border-border w-fit">
        {([["COLLECTION", "Collection", "/admin/categories"], ["DECOR", "Decor", "/admin/categories?kind=decor"]] as const).map(([value, label, href]) => (
          <Link
            key={value}
            href={href}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={kind === value ? { background: "#2b1807", color: "#e8d5b7" } : { color: "var(--muted-foreground)" }}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {total} {kind === "DECOR" ? "decor " : ""}categor{total === 1 ? "y" : "ies"}
        </p>
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
            <Plus className="w-4 h-4" /> {kind === "DECOR" ? "Add Decor Category" : "Add Category"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">No categories yet.</p>
      ) : view === "table" ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Cover</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Description</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Gallery</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    {c.imageUrl ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <Image src={cldImage(c.imageUrl, 96)} alt={c.name} fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted shrink-0" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <img src={`/${iconForCategory(c.name, c.icon)}`} alt="" className="w-7 h-7 object-contain rounded-full border border-border" />
                      {c.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{c.description ? stripHtmlToText(c.description) : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.images?.length ?? 0} photo{c.images?.length === 1 ? "" : "s"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => setImagesManagerFor(c)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">
                        <Images className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden">
              {c.imageUrl && (
                <div className="relative h-40 w-full">
                  <Image key={c.imageUrl} src={cldImage(c.imageUrl, 600)} alt={c.name} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-foreground inline-flex items-center gap-2">
                  <img src={`/${iconForCategory(c.name, c.icon)}`} alt="" className="w-7 h-7 object-contain rounded-full border border-border" />
                  {c.name}
                </h3>
                {c.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{stripHtmlToText(c.description)}</p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">{c.images?.length ?? 0} gallery image(s)</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button onClick={() => openEdit(c)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => setImagesManagerFor(c)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">
                    <Images className="w-3 h-3" /> Gallery
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

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{modal.editing ? "Edit Category" : "Add Category"}</h2>
              <button onClick={closeModal}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name *" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground" />
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
                        style={{
                          border: selected ? "2px solid #2b1807" : "1px solid var(--border)",
                          background: selected ? "#fdf6ee" : "transparent",
                        }}
                      >
                        <img src={`/${ic.file}`} alt="" className="w-3/4 h-3/4 object-contain" />
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {form.icon ? CATEGORY_ICONS.find((i) => i.file === form.icon)?.label : "No icon picked — one is chosen from the name."}
                </p>
              </div>
              <RichTextEditor value={form.description} onChange={(html) => setForm((f) => ({ ...f, description: html }))} placeholder="Description" />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cover Image (used on cards)</label>
                <input type="file" accept="image/*" onChange={handleUpload} className="text-sm text-muted-foreground" />
                {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
                {form.imageUrl && <img src={form.imageUrl} alt="preview" className="mt-2 h-24 w-full object-cover rounded-lg" />}
              </div>
              {modal.editing && (
                <p className="text-xs text-muted-foreground">
                  Add more photos of this service via the <strong>Gallery</strong> button after saving — the homepage shows two of them side by side.
                </p>
              )}
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

      {imagesManagerFor && (
        <CategoryImagesManager
          category={imagesManagerFor}
          onClose={() => setImagesManagerFor(null)}
          onChange={(images) => {
            setImagesManagerFor((f) => (f ? { ...f, images } : f));
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
