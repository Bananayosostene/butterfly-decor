"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

type StyleIdea = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  createdAt: string;
};

const PAGE_SIZE = 16;

export default function StyleInspirationsPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<StyleIdea[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const queryRef = useRef(query);

  const fetchIdeas = (q: string, pageNum: number) => {
    const params = new URLSearchParams({ page: String(pageNum), limit: String(PAGE_SIZE) });
    if (q.trim()) params.set("q", q.trim());
    return fetch(`/api/style-ideas?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => ({ data: res.data ?? [], pagination: res.pagination }));
  };

  // Initial load
  useEffect(() => {
    fetchIdeas("", 1).then(({ data, pagination }) => {
      setIdeas(data);
      setTotalPages(pagination?.totalPages ?? 1);
      setTotalResults(pagination?.total ?? data.length);
      setLoading(false);
    });
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (isFetchingRef.current) return;
    const nextPage = page + 1;
    if (nextPage > totalPages) return;

    isFetchingRef.current = true;
    setLoadingMore(true);

    try {
      const { data, pagination } = await fetchIdeas(queryRef.current, nextPage);
      setIdeas((prev) => [...prev, ...data]);
      setTotalPages(pagination?.totalPages ?? totalPages);
      setTotalResults(pagination?.total ?? totalResults);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [page, totalPages, totalResults]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage]);

  const runSearch = async (q: string, pageNum: number) => {
    setSearching(true);
    const { data, pagination } = await fetchIdeas(q, pageNum);
    setIdeas(data);
    setTotalPages(pagination?.totalPages ?? 1);
    setTotalResults(pagination?.total ?? data.length);
    setPage(1);
    setSearching(false);
  };

  // Debounced search on query change — always resets to page 1
  const handleSearch = (value: string) => {
    setQuery(value);
    queryRef.current = value;
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value, 1), 400);
  };

  const clearSearch = () => handleSearch("");

  const showSkeletons = loading || searching;

  const hasMore = page < totalPages;

  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      <div ref={topRef} />
      {/* Header */}
      <div className="text-center px-6 pt-8 pb-4">
        <h1
          className="text-3xl md:text-4xl mb-2"
          style={{ fontFamily: "'Playball', cursive", color: "var(--primary)" }}
        >
          Outfit Ideas
        </h1>
        <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          Discover stylish outfit ideas and inspiration for every special moment.
        </p>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-6 max-w-lg mx-auto">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}
        >
          <Search size={15} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search outfit ideas..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--foreground)" }}
          />
          {query && (
            <button onClick={clearSearch} className="shrink-0">
              <X size={14} style={{ color: "var(--muted-foreground)" }} />
            </button>
          )}
        </div>
        {query && !searching && (
          <p className="text-xs mt-2 text-center" style={{ color: "var(--muted-foreground)" }}>
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Masonry grid */}
      <div className="px-3 md:px-6 max-w-7xl mx-auto pb-16">
        {showSkeletons ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-3 rounded-2xl animate-pulse"
                style={{
                  aspectRatio: i % 4 === 0 ? "3/4" : i % 4 === 1 ? "4/5" : i % 4 === 2 ? "1/1" : "3/5",
                  background: "var(--muted)",
                }}
              />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {query ? `No results for "${query}".` : "No ideas found."}
            </p>
            {query && (
              <button onClick={clearSearch} className="mt-3 text-xs underline" style={{ color: "var(--primary)" }}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {ideas.map((idea, idx) => (
                <div
                  key={idea.id}
                  className="break-inside-avoid mb-3 group cursor-pointer"
                  onClick={() => router.push(`/style-insipiration/${idea.id}`)}
                >
                  <div
                    className="relative overflow-hidden rounded-2xl"
                    style={{ aspectRatio: idx % 4 === 0 ? "3/4" : idx % 4 === 1 ? "4/5" : idx % 4 === 2 ? "1/1" : "3/5" }}
                  >
                    <Image
                      src={idea.imageUrl}
                      alt={idea.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 px-2.5 py-2"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}
                    >
                      <p className="text-white text-base sm:text-lg font-semibold truncate" style={{ fontFamily: "Georgia, serif", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                        {idea.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {hasMore && <div ref={sentinelRef} className="h-4" />}
            {loadingMore && (
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 mt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="break-inside-avoid mb-3 rounded-2xl animate-pulse"
                    style={{
                      aspectRatio: i % 4 === 0 ? "3/4" : i % 4 === 1 ? "4/5" : i % 4 === 2 ? "1/1" : "3/5",
                      background: "var(--muted)",
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
