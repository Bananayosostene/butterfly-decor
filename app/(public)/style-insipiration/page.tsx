"use client";

import { useEffect, useState, useRef } from "react";
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

export default function StyleInspirationsPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<StyleIdea[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchIdeas = (q: string) => {
    const url = q.trim() ? `/api/style-ideas?q=${encodeURIComponent(q.trim())}` : "/api/style-ideas";
    return fetch(url).then((r) => r.json()).then((res) => res.data ?? []);
  };

  // Initial load
  useEffect(() => {
    fetchIdeas("").then((data) => {
      setIdeas(data);
      setLoading(false);
    });
  }, []);

  // Debounced search on query change
  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const data = await fetchIdeas(value);
      setIdeas(data);
      setSearching(false);
    }, 400);
  };

  const clearSearch = () => handleSearch("");

  const showSkeletons = loading || searching;

  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
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
            {ideas.length} result{ideas.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
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
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3"
                    style={{ background: "linear-gradient(to top, rgba(30,16,8,0.85) 0%, transparent 60%)" }}
                  >
                    <p className="text-xs font-semibold leading-snug" style={{ color: "#e8d5b7" }}>
                      {idea.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
