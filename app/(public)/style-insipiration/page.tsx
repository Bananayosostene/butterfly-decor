"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type StyleIdea = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  tags: string[];
  createdAt: string;
};

export default function StyleInspirationsPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<StyleIdea[]>([]);
  const [activeTag, setActiveTag] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/style-ideas")
      .then((r) => r.json())
      .then((res) => setIdeas(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const allTags = ["All", ...Array.from(new Set(ideas.flatMap((i) => i.tags)))];
  const filtered = activeTag === "All" ? ideas : ideas.filter((i) => i.tags.includes(activeTag));

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

      {/* Tag filters */}
      {allTags.length > 1 && (
        <div className="flex justify-center gap-2 flex-wrap px-6 pb-6">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={
                activeTag === tag
                  ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                  : { border: "1px solid var(--primary)", color: "var(--primary)", background: "transparent" }
              }
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Masonry grid */}
      <div className="px-3 md:px-6 max-w-7xl mx-auto pb-16">
        {loading ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-3 rounded-2xl animate-pulse"
                style={{
                  aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/5",
                  background: "var(--muted)",
                }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16 text-sm" style={{ color: "var(--muted-foreground)" }}>
            No ideas found.
          </p>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {filtered.map((idea, idx) => (
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
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3"
                    style={{ background: "linear-gradient(to top, rgba(30,16,8,0.85) 0%, transparent 60%)" }}
                  >
                    <p className="text-xs font-semibold leading-snug" style={{ color: "#e8d5b7" }}>
                      {idea.title}
                    </p>
                    {idea.tags.length > 0 && (
                      <p className="text-[10px] mt-0.5" style={{ color: "rgba(232,213,183,0.7)" }}>
                        {idea.tags.slice(0, 2).join(" · ")}
                      </p>
                    )}
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
