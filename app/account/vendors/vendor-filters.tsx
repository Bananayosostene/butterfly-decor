"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { vendorsHref } from "./href";

const INPUT = "px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground";

/** Search box and category filter: they only change the address, and the server page renders again. */
export default function VendorFilters({
  q, category, categories, summary,
}: {
  q: string;
  category: string;
  categories: { id: string; name: string }[];
  /** e.g. "3 of 12 vendors" */
  summary: string;
}) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [search, setSearch] = useState(q);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = (nextQ: string, nextCategory: string) => startTransition(() => router.replace(vendorsHref(nextQ, nextCategory), { scroll: false }));

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => go(value.trim(), category), 350);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by name..." aria-label="Search by name" className={`${INPUT} w-full pl-9`} />
      </div>
      <select value={category} onChange={(e) => go(search.trim(), e.target.value)} aria-label="Filter by category" className={INPUT}>
        <option value="">All categories</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <p className="text-sm text-muted-foreground">{loading ? "Loading..." : summary}</p>
    </div>
  );
}
