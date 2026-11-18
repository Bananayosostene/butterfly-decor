"use client";

import { Pause, Play, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton({ children, danger, pendingText }: { children: React.ReactNode; danger?: boolean; pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-60 hover:bg-accent"
      style={danger ? { borderColor: "var(--destructive)", color: "var(--destructive)" } : { borderColor: "var(--border)", color: "var(--foreground)" }}
    >
      {pending ? pendingText : children}
    </button>
  );
}

/** Pause or continue recording visits, and delete every recorded visit (after a confirmation). */
export function VisitorControls({
  tracking,
  total,
  toggleTracking,
  deleteAll,
}: {
  tracking: boolean;
  total: number;
  toggleTracking: () => Promise<void>;
  deleteAll: () => Promise<void>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={toggleTracking}>
        <SubmitButton pendingText={tracking ? "Pausing…" : "Starting…"}>
          {tracking ? <><Pause className="w-4 h-4" /> Pause recording visitors</> : <><Play className="w-4 h-4" /> Continue recording visitors</>}
        </SubmitButton>
      </form>
      <form
        action={deleteAll}
        onSubmit={(e) => {
          if (!confirm(`Delete all ${total} recorded visits, yours included? This cannot be undone.`)) e.preventDefault();
        }}
      >
        <SubmitButton danger pendingText="Deleting…">
          <Trash2 className="w-4 h-4" /> Delete all visitor data
        </SubmitButton>
      </form>
    </div>
  );
}
