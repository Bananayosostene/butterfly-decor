"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cldImage } from "@/lib/image";

type Profile = {
  businessName: string | null;
  location: string | null;
  phone: string | null;
  about: string | null;
  coverUrl: string | null;
  vendorCategoryId: string | null;
};

const inputClass = "w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground";

export default function MyProfileClient({
  profile,
  categories,
}: {
  profile: Profile;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: profile.businessName ?? "",
    location: profile.location ?? "",
    phone: profile.phone ?? "",
    about: profile.about ?? "",
    coverUrl: profile.coverUrl ?? "",
    vendorCategoryId: profile.vendorCategoryId ?? "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

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
    if (json.success) setForm((f) => ({ ...f, coverUrl: json.data.url }));
    else setError(json.message ?? "Upload failed.");
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/vendor/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, coverUrl: form.coverUrl || null, vendorCategoryId: form.vendorCategoryId || undefined }),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).message ?? "Could not save.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-card border border-border rounded-xl p-6 space-y-4">
      <p className="text-sm text-muted-foreground">This is what couples see on your public vendor page.</p>
      {error && <p className="text-sm py-2 px-3 rounded-lg" style={{ background: "#fde8e8", color: "#991b1b" }}>{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs text-muted-foreground mb-1 block">Business name *</span>
          <input value={form.businessName} onChange={set("businessName")} required maxLength={80} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground mb-1 block">Category</span>
          <select value={form.vendorCategoryId} onChange={set("vendorCategoryId")} className={inputClass}>
            {!form.vendorCategoryId && <option value="">Choose a category</option>}
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground mb-1 block">Location</span>
          <input value={form.location} onChange={set("location")} maxLength={80} placeholder="e.g. Kigali, Rwanda" className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground mb-1 block">Phone / WhatsApp</span>
          <input type="tel" value={form.phone} onChange={set("phone")} maxLength={20} placeholder="+250 788 000 000" className={inputClass} />
        </label>
      </div>

      <label className="block">
        <span className="text-xs text-muted-foreground mb-1 block">About your business</span>
        <textarea value={form.about} onChange={set("about")} maxLength={2000} rows={6} className={`${inputClass} resize-y`} />
      </label>

      <div>
        <span className="text-xs text-muted-foreground mb-1 block">Cover photo (shown in the vendor list; your newest gallery photo is used if empty)</span>
        <input type="file" accept="image/*" onChange={handleUpload} className="text-sm text-muted-foreground" />
        {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
        {form.coverUrl && (
          <div className="mt-2 flex items-end gap-3">
            <img src={cldImage(form.coverUrl, 400)} alt="Cover preview" className="h-28 w-28 object-cover rounded-lg" />
            <button type="button" onClick={() => setForm((f) => ({ ...f, coverUrl: "" }))} className="text-xs underline text-muted-foreground">
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving || uploading} className="px-5 py-2 text-sm rounded-lg font-medium disabled:opacity-50" style={{ background: "#2b1807", color: "#e8d5b7" }}>
          {saving ? "Saving..." : "Save profile"}
        </button>
        {saved && <span className="flex items-center gap-1 text-xs text-green-700"><Check className="w-3.5 h-3.5" /> Saved</span>}
      </div>
    </form>
  );
}
