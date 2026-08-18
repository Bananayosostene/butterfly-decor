"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className={`flex items-center justify-center gap-1.5 flex-wrap ${className ?? ""}`} aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="w-8 h-8 flex items-center justify-center rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors"
            style={
              p === page
                ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                : { color: "var(--foreground)" }
            }
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
