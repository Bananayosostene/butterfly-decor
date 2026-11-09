"use client";

import { useState } from "react";
import { displaySerif } from "@/lib/fonts";

const inputClass =
  "w-full px-3.5 py-2 rounded-lg text-sm bg-background text-foreground border border-border outline-none focus:border-primary";

export default function PhoneForm() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/google/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.message ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = json.data?.next ?? "/";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto rounded-2xl px-6 py-5 md:px-8 md:py-6 shadow-xl border-t-4"
      style={{ background: "rgba(253,250,246,0.94)", borderTopColor: "var(--ink)", backdropFilter: "blur(6px)" }}
    >
      <div className="text-center mb-5">
        <p className={`${displaySerif.className} text-base`} style={{ color: "var(--ink)" }}>Butterfly Decor</p>
        <h1 className={`${displaySerif.className} mt-1.5 text-xl md:text-2xl leading-tight`} style={{ color: "var(--ink)" }}>
          One last step
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "#57422C" }}>
          Please enter your phone number to complete your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="text-sm py-2 px-3 rounded-lg" style={{ background: "#fde8e8", color: "#991b1b" }}>
            {error}
          </div>
        )}
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="Phone, e.g. +250 788 000 000"
          autoComplete="tel"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
          style={{ background: "var(--ink)", color: "var(--cream)" }}
        >
          {loading ? "Please wait…" : "Complete sign-up"}
        </button>
      </form>
    </div>
  );
}
