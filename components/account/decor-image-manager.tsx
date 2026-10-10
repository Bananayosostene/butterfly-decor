"use client";

import { useState } from "react";
import { Upload, Check, Trash2 } from "lucide-react";
import { cldImage } from "@/lib/image";

const MAX_MB = 20;

export function DecorImageManager({ initialImageUrl }: { initialImageUrl: string | null }) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const saveUrl = async (url: string | null) => {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decorImageUrl: url }),
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.message ?? "Failed to save");
      return;
    }
    setImageUrl(json.data.decorImageUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image is too large (max ${MAX_MB}MB).`);
      return;
    }
    setError("");
    setUploading(true);
    try {
      // Phone photos are often several MB, so upload straight to Cloudinary with a signed request
      // instead of passing the file through our server (which has a ~4.5MB request limit).
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "butterfly-home" }),
      });
      const signJson = await signRes.json();
      if (!signJson.success) { setError("Could not get upload signature"); return; }
      const { signature, timestamp, cloudName, apiKey, folder } = signJson.data;

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", apiKey);
      fd.append("timestamp", String(timestamp));
      fd.append("signature", signature);
      fd.append("folder", folder);
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
      const cloudJson = await cloudRes.json();
      if (!cloudJson.secure_url) { setError(cloudJson.error?.message ?? "Upload failed"); return; }

      await saveUrl(cloudJson.secure_url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove the decor background image?")) return;
    setError("");
    await saveUrl(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        This photo sits behind the &ldquo;Transform Your Venue&rdquo; section on the homepage. Pick a wide photo of a
        decorated venue; it is shown with a soft cream overlay so the text stays readable.
      </p>

      {imageUrl ? (
        <img src={cldImage(imageUrl, 800)} alt="Decor section background" className="w-full max-w-sm aspect-[16/9] object-cover rounded-lg border border-border" />
      ) : (
        <p className="text-xs text-muted-foreground italic">No image yet — the section shows a plain cream background.</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${uploading ? "opacity-60 pointer-events-none" : ""}`}
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : imageUrl ? "Replace image" : "Upload image"}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        {imageUrl && !uploading && (
          <button onClick={handleRemove} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border dash-danger-btn">
            <Trash2 className="w-4 h-4" /> Remove
          </button>
        )}
      </div>

      {saved && (
        <p className="flex items-center gap-1 text-xs dash-ok-text">
          <Check className="w-3.5 h-3.5" /> Saved — live on the homepage now.
        </p>
      )}
      {error && <p className="text-xs dash-danger-text">{error}</p>}
    </div>
  );
}
