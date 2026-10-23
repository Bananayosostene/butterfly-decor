"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/** Approve / suspend buttons on a vendor row. */
export default function VendorStatus({ vendorId, status }: { vendorId: string; status: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  const set = async (next: string) => {
    setSaving(true);
    await fetch(`/api/vendors/${vendorId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) }).catch(() => {});
    setSaving(false);
    startTransition(() => router.refresh());
  };

  const chip =
    status === "PENDING"
      ? { label: "Waiting", style: { background: "var(--dash-soft)", color: "var(--dash-accent)" } }
      : status === "SUSPENDED"
        ? { label: "Hidden", style: { background: "var(--dash-danger-bg)", color: "var(--dash-danger)" } }
        : { label: "Live", style: { background: "var(--dash-ok-bg)", color: "var(--dash-ok)" } };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={chip.style}>{chip.label}</span>
      {status !== "APPROVED" && (
        <button onClick={() => set("APPROVED")} disabled={saving} className="px-2.5 py-1 rounded-lg text-xs font-medium disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          Approve
        </button>
      )}
      {status !== "SUSPENDED" && (
        <button onClick={() => set("SUSPENDED")} disabled={saving} className="px-2.5 py-1 rounded-lg text-xs font-medium border dash-danger-btn disabled:opacity-50">
          Hide
        </button>
      )}
    </div>
  );
}
