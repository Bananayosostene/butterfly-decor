"use client";

import { useState } from "react";
import { X, Trash2, ChevronUp, ChevronDown, Upload } from "lucide-react";

type CategoryImage = { id: string; imageUrl: string; order: number };
type Category = { id: string; name: string; images?: CategoryImage[] };

export function CategoryImagesManager({
  category,
  onClose,
  onChange,
}: {
  category: Category;
  onClose: () => void;
  onChange: (images: CategoryImage[]) => void;
}) {
  const [images, setImages] = useState<CategoryImage[]>(category.images ?? []);
  const [uploading, setUploading] = useState(false);

  const update = (next: CategoryImage[]) => {
    setImages(next);
    onChange(next);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "butterfly-categories");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) return;

      const res = await fetch(`/api/categories/${category.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadJson.data.url }),
      });
      const json = await res.json();
      if (json.success) update([...images, json.data]);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    await fetch(`/api/categories/${category.id}/images/${imageId}`, { method: "DELETE" });
    update(images.filter((img) => img.id !== imageId));
  };

  const handleReorder = async (imageId: string, direction: "up" | "down") => {
    const res = await fetch(`/api/categories/${category.id}/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    const json = await res.json();
    if (json.success) update(json.data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Gallery — {category.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              The homepage services section shows the first two images side by side.
            </p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-3 text-sm text-muted-foreground cursor-pointer hover:bg-muted">
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Add photo"}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>

        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No gallery photos yet.</p>
        ) : (
          <div className="space-y-2">
            {images.map((img, i) => (
              <div key={img.id} className="flex items-center gap-3 border border-border rounded-lg p-2">
                <span className="text-xs font-mono text-muted-foreground w-5 shrink-0 text-center">{i + 1}</span>
                <img src={img.imageUrl} alt="" className="w-14 h-14 object-cover rounded-md shrink-0" />
                <div className="flex-1" />
                <div className="flex flex-col">
                  <button onClick={() => handleReorder(img.id, "up")} disabled={i === 0} className="disabled:opacity-30 text-muted-foreground hover:text-foreground">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleReorder(img.id, "down")} disabled={i === images.length - 1} className="disabled:opacity-30 text-muted-foreground hover:text-foreground">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => handleDelete(img.id)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg font-medium" style={{ background: "#2b1807", color: "#e8d5b7" }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
