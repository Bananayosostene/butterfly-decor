"use client";

import type React from "react";
import { useState } from "react";
import { displaySerif } from "@/lib/fonts";

type Category = { id: string; name: string };

const INK = "#2b1807";
const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg text-sm bg-background text-foreground border border-border outline-none focus:border-primary";

export default function WelcomeClient({ name, categories }: { name: string; categories: Category[] }) {
  const [isVendor, setIsVendor] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (body: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.message ?? "Could not save. Please try again.");
        setSaving(false);
        return;
      }
      // A full page load so the dashboard (for vendors) starts with the new role.
      window.location.href = json.data?.next ?? "/";
    } catch {
      setError("Could not save. Please try again.");
      setSaving(false);
    }
  };

  const submitVendor = (e: React.FormEvent) => {
    e.preventDefault();
    save({ vendor: true, businessName, vendorCategoryId: categoryId, location, about });
  };

  return (
    <div className="min-h-[80vh] px-4 py-12" style={{ background: "#fbf7f2" }}>
      <div className="max-w-xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "#835105" }}>One last step</p>
        <h1 className={`${displaySerif.className} mt-2 text-4xl`} style={{ color: INK }}>
          Welcome, {name}
        </h1>
        <p className="mt-2 text-base" style={{ color: "#57422C" }}>Are you a wedding vendor?</p>

        {error && <p className="mt-4 text-sm py-2 px-3 rounded-lg" style={{ background: "#fde8e8", color: "#991b1b" }}>{error}</p>}

        {!isVendor ? (
          <div className="mt-8 grid sm:grid-cols-2 gap-4 text-left">
            <button
              onClick={() => save({ vendor: false })}
              disabled={saving}
              className="rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
            >
              <p className={`${displaySerif.className} text-2xl`} style={{ color: INK }}>No</p>
              <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                I am planning or attending a wedding. I want to browse, like and comment.
              </p>
            </button>
            <button
              onClick={() => setIsVendor(true)}
              disabled={saving}
              className="rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
            >
              <p className={`${displaySerif.className} text-2xl`} style={{ color: INK }}>Yes</p>
              <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                I offer a wedding service and want my own gallery on the vendors page.
              </p>
            </button>
          </div>
        ) : (
          <form
            onSubmit={submitVendor}
            className="mt-8 rounded-2xl p-6 space-y-3 text-left"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <label className="block">
              <span className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Business name</span>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required maxLength={80} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>What do you offer?</span>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className={inputClass}>
                <option value="">Choose your vendor category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Location</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={80} placeholder="e.g. Kigali, Rwanda" className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>
                About your business — shown on your page under &ldquo;About this vendor&rdquo;
              </span>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                required
                maxLength={2000}
                rows={5}
                placeholder="What you offer, your style and experience, and what couples can expect from you."
                className={`${inputClass} resize-y`}
              />
            </label>
            {categories.length === 0 && (
              <p className="text-xs" style={{ color: "#991b1b" }}>
                No vendor categories are available yet. Please try again later or continue as a client.
              </p>
            )}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button type="button" onClick={() => setIsVendor(false)} className="text-sm underline cursor-pointer" style={{ color: "var(--muted-foreground)" }}>
                ← Back
              </button>
              <button
                type="submit"
                disabled={saving || categories.length === 0}
                className="px-6 py-2.5 rounded-full text-sm font-semibold disabled:opacity-50 cursor-pointer"
                style={{ background: INK, color: "#f7efe3" }}
              >
                {saving ? "Saving…" : "Create my vendor account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
