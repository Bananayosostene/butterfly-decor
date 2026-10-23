"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const INK = "#2b1807";
const LINE = "#e8d5b7";
const field = "w-full h-10 px-3 rounded-md text-sm bg-white outline-none focus:ring-2 focus:ring-[#835105]/30";

type Details = { name: string; phone: string; birthday: string; emailUpdates: boolean };

/** Name, phone, birthday and the news-email choice, saved together. */
export default function ProfileForm({ initial }: { initial: Details }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  const set = (key: keyof Details) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
    setState("idle");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setState("saving");
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await res.json().catch(() => null);
    if (!json?.success) {
      setError(json?.message || "Could not save.");
      setState("idle");
      return;
    }
    setState("saved");
    router.refresh();
  };

  const label = "block text-xs font-semibold mb-1";
  return (
    <form onSubmit={save} className="mt-4 grid sm:grid-cols-2 gap-4">
      <label className="block">
        <span className={label} style={{ color: INK }}>Name</span>
        <input value={form.name} onChange={set("name")} required maxLength={60} className={field} style={{ border: `1px solid ${LINE}`, color: INK }} />
      </label>
      <label className="block">
        <span className={label} style={{ color: INK }}>Phone</span>
        <input type="tel" value={form.phone} onChange={set("phone")} maxLength={20} placeholder="+250 788 000 000" className={field} style={{ border: `1px solid ${LINE}`, color: INK }} />
      </label>
      <label className="block">
        <span className={label} style={{ color: INK }}>Birthday</span>
        <input type="date" value={form.birthday} onChange={set("birthday")} max={new Date().toISOString().slice(0, 10)} className={field} style={{ border: `1px solid ${LINE}`, color: INK }} />
      </label>
      <label className="flex items-center gap-2.5 self-end h-10 text-sm cursor-pointer" style={{ color: INK }}>
        <input type="checkbox" checked={form.emailUpdates} onChange={set("emailUpdates")} className="w-4 h-4" style={{ accentColor: INK }} />
        Send me news about new looks and decor
      </label>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={state === "saving"} className="h-10 px-6 rounded-full text-sm font-semibold disabled:opacity-60 cursor-pointer" style={{ background: INK, color: "#f7efe3" }}>
          {state === "saving" ? "Saving..." : "Save"}
        </button>
        {state === "saved" && <span className="text-sm" style={{ color: "#166534" }}>Saved</span>}
        {error && <span className="text-sm" style={{ color: "#991b1b" }}>{error}</span>}
      </div>
    </form>
  );
}
