"use client";

import type React from "react";
import { useState } from "react";
import { displaySerif } from "@/lib/fonts";

type Category = { id: string; name: string };

const INK = "var(--ink)";
const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg text-sm bg-background text-foreground border border-border outline-none focus:border-primary";

export default function WelcomeClient({ name, categories }: { name: string; categories: Category[] }) {
  // null until the visitor picks Yes or No.
  const [isVendor, setIsVendor] = useState<boolean | null>(null);
  // Step 1 asks the question; step 2 (vendors only) collects the business details.
  const [step, setStep] = useState<1 | 2>(1);
  const [businessName, setBusinessName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVendor === null) return;
    // "Next" on the question: vendors continue to their details, clients are done.
    if (isVendor && step === 1) {
      setStep(2);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isVendor ? { vendor: true, businessName, vendorCategoryId: categoryId, location, about } : { vendor: false },
        ),
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

  const noCategories = isVendor === true && categories.length === 0;

  const radio = (value: boolean, label: string) => (
    <label className="flex items-center gap-3 cursor-pointer text-base" style={{ color: INK }}>
      <input
        type="radio"
        name="isVendor"
        checked={isVendor === value}
        onChange={() => setIsVendor(value)}
        className="w-4 h-4 cursor-pointer"
        style={{ accentColor: INK }}
      />
      {label}
    </label>
  );

  return (
    <div className="min-h-[80vh] px-4 py-12" style={{ background: "#fbf7f2" }}>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "#835105" }}>One last step</p>
        <h1 className={`${displaySerif.className} mt-2 text-xl md:text-2xl`} style={{ color: INK }}>
          Welcome, {name}
        </h1>

        {error && <p className="mt-4 text-sm py-2 px-3 rounded-lg" style={{ background: "#fde8e8", color: "#991b1b" }}>{error}</p>}

        {step === 1 && (
          <fieldset className="mt-8">
            <legend className="text-base font-semibold" style={{ color: INK }}>Are you a wedding vendor?</legend>
            <div className="mt-3 space-y-2.5">
              {radio(true, "Yes")}
              {radio(false, "No")}
            </div>
          </fieldset>
        )}

        {/* Vendors tell us about their business before finishing. */}
        {step === 2 && (
          <div className="mt-6 space-y-3">
            <p className="text-base font-semibold" style={{ color: INK }}>Tell couples about your business</p>
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
                About your business 
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
            {noCategories && (
              <p className="text-xs" style={{ color: "#991b1b" }}>
                No vendor categories are available yet. Please try again later, or go back and choose No to continue as a client.
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={saving}
              className="px-6 py-3 rounded-full text-sm font-semibold cursor-pointer"
              style={{ border: `1px solid ${INK}`, color: INK }}
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={saving || isVendor === null || (step === 2 && noCategories)}
            className="flex-1 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            style={{ background: INK, color: "var(--cream)" }}
          >
            {saving ? "Saving…" : step === 1 ? "Next" : "Complete signup"}
          </button>
        </div>
      </form>
    </div>
  );
}
