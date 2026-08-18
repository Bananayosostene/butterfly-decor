"use client";

import { useEffect, useState } from "react";
import { Upload, Check } from "lucide-react";

export function HeroVideoManager() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((res) => setVideoUrl(res?.data?.heroVideoUrl ?? null))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "butterfly-hero");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) {
        setError(uploadJson.message ?? "Upload failed");
        return;
      }

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroVideoUrl: uploadJson.data.url }),
      });
      const json = await res.json();
      if (json.success) {
        setVideoUrl(json.data.heroVideoUrl);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(json.message ?? "Failed to save");
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        This video plays behind the homepage hero. If none is set, the site falls back to a
        default clip bundled with the app.
      </p>

      {videoUrl ? (
        <video src={videoUrl} controls muted className="w-full max-w-sm rounded-lg border border-border" />
      ) : (
        <p className="text-xs text-muted-foreground italic">Using the default bundled video — no custom upload yet.</p>
      )}

      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50" style={{ background: "#2b1807", color: "#e8d5b7" }}>
        <Upload className="w-4 h-4" />
        {uploading ? "Uploading..." : "Upload new video"}
        <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {saved && (
        <p className="flex items-center gap-1 text-xs text-green-700">
          <Check className="w-3.5 h-3.5" /> Saved — live on the homepage now.
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-muted-foreground">Max 60MB. MP4 recommended, keep it under ~15 seconds for a smooth loop.</p>
    </div>
  );
}
