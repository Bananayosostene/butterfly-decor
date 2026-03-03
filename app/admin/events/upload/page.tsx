"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UploadPortfolioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    category: "Weddings",
    imageUrl: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const categories = ["Weddings", "Birthdays", "Church", "Memorial"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUploadToCloudinary = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      setError("Failed to upload image to Cloudinary");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to upload");

      router.push("/admin/events");
    } catch (err) {
      setError("Failed to upload portfolio image");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link
            href="/admin/events"
            className="text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Portfolio
          </Link>
          <h1 className="text-2xl   font-bold text-foreground">Upload Image</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-card border border-border rounded-lg p-8"
        >
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Image Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
              placeholder="e.g., Summer Wedding 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Select Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
            />
            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleUploadToCloudinary}
                  disabled={uploading || !!formData.imageUrl}
                  className="mt-2 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-smooth disabled:opacity-50"
                >
                  {uploading ? "Uploading to Cloudinary..." : formData.imageUrl ? "✓ Uploaded" : "Upload to Cloudinary"}
                </button>
              </div>
            )}
          </div>

          {formData.imageUrl && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              ✓ Image uploaded successfully to Cloudinary
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.imageUrl}
            className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-smooth disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save to Portfolio"}
          </button>
        </form>
      </div>
    </div>
  );
}
