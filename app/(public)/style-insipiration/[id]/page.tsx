"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type StyleIdea = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  createdAt: string;
};

export default function StyleIdeaDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<StyleIdea | null>(null);
  const [allIdeas, setAllIdeas] = useState<StyleIdea[]>([]);
  const [related, setRelated] = useState<StyleIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgFading, setImgFading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ideasPage, setIdeasPage] = useState(1);
  const [ideasTotalPages, setIdeasTotalPages] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const selectFromList = (targetId: string, list: StyleIdea[]) => {
    const current = list.find((i) => i.id === targetId) ?? null;
    setIdea(current);
  };

  useEffect(() => {
    if (idea) {
      setRelated(allIdeas.filter((i) => i.id !== idea.id));
    }
  }, [allIdeas, idea]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/style-ideas/${id}`).then((r) => r.json()),
      fetch("/api/style-ideas?page=1&limit=24").then((r) => r.json()),
    ]).then(([single, all]) => {
      const current: StyleIdea = single.data;
      const list: StyleIdea[] = all.data ?? [];
      const merged = current && !list.some((i) => i.id === current.id) ? [current, ...list] : list;
      setAllIdeas(merged);
      setIdeasTotalPages(all.pagination?.totalPages ?? 1);
      setIdeasPage(1);
      selectFromList(id as string, merged);
    }).finally(() => setLoading(false));
  }, [id]);

  const fetchNextIdeasPage = useCallback(async () => {
    if (isFetchingRef.current) return;
    const nextPage = ideasPage + 1;
    if (nextPage > ideasTotalPages) return;

    isFetchingRef.current = true;
    setLoadingMore(true);

    try {
      const res = await fetch(`/api/style-ideas?page=${nextPage}&limit=24`);
      const json = await res.json();
      const more: StyleIdea[] = json.data ?? [];
      setAllIdeas((prev) => [...prev, ...more]);
      setIdeasTotalPages(json.pagination?.totalPages ?? ideasTotalPages);
      setIdeasPage(nextPage);
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [ideasPage, ideasTotalPages]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextIdeasPage();
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextIdeasPage]);

  const currentIndex = idea ? allIdeas.findIndex((i) => i.id === idea.id) : -1;
  const prevIdea = allIdeas.length > 1 && currentIndex !== -1 ? allIdeas[(currentIndex - 1 + allIdeas.length) % allIdeas.length] : null;
  const nextIdea = allIdeas.length > 1 && currentIndex !== -1 ? allIdeas[(currentIndex + 1) % allIdeas.length] : null;

  const goToSibling = (sibling: StyleIdea | null) => {
    if (!sibling) return;
    router.replace(`/style-insipiration/${sibling.id}`, { scroll: false });
    setImgFading(true);
    setTimeout(() => {
      selectFromList(sibling.id, allIdeas);
      setImgFading(false);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 180);
  };

  if (loading) {
    return (
      <main className="min-h-screen pb-16" style={{ background: "var(--background)" }}>
        {/* Detail card skeleton */}
        <div className="max-w-4xl mx-auto pt-4 px-4 md:px-8">
          <div
            className="flex flex-col md:flex-row overflow-hidden rounded-3xl"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            {/* Image skeleton */}
            <div className="w-full md:w-[55%] shrink-0 animate-pulse" style={{ minHeight: "340px", background: "var(--muted)" }} />
            {/* Info skeleton */}
            <div className="flex flex-col gap-4 p-6 md:p-8 flex-1">
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full animate-pulse" style={{ background: "var(--muted)" }} />
                <div className="h-5 w-20 rounded-full animate-pulse" style={{ background: "var(--muted)" }} />
              </div>
              <div className="h-8 w-3/4 rounded-xl animate-pulse" style={{ background: "var(--muted)" }} />
              <div className="h-4 w-full rounded animate-pulse" style={{ background: "var(--muted)" }} />
              <div className="h-4 w-5/6 rounded animate-pulse" style={{ background: "var(--muted)" }} />
              <div className="border-t" style={{ borderColor: "var(--border)" }} />
              <div className="h-11 rounded-full animate-pulse" style={{ background: "var(--muted)" }} />
              <div className="h-3 w-32 rounded mx-auto animate-pulse" style={{ background: "var(--muted)" }} />
            </div>
          </div>
        </div>
        {/* Related skeletons */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-3">
                <div
                  className="w-full rounded-2xl animate-pulse"
                  style={{ background: "var(--muted)", aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/5" }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--background)" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Idea not found.</p>
        <button onClick={() => router.back()} className="text-sm underline" style={{ color: "var(--primary)" }}>Go back</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-16" style={{ background: "var(--background)" }}>
      <div ref={topRef} />

      {/* Pin card — Pinterest style */}
      <div className="max-w-4xl mx-auto pt-4 px-4 md:px-8">
        <div
          className="flex flex-col md:flex-row overflow-hidden rounded-3xl shadow-xl"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          {/* Left — image */}
          <div
            className="relative w-full md:w-[55%] shrink-0 flex items-center justify-center"
            style={{ background: "var(--muted)", minHeight: "340px", maxHeight: "420px" }}
          >
            <Image
              src={idea.imageUrl}
              alt={idea.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 55vw"
              priority
              style={{ transition: "opacity 0.18s ease", opacity: imgFading ? 0 : 1 }}
            />
            {prevIdea && (
              <button
                onClick={() => goToSibling(prevIdea)}
                aria-label="Previous idea"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors z-10"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
            )}
            {nextIdea && (
              <button
                onClick={() => goToSibling(nextIdea)}
                aria-label="Next idea"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors z-10"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {/* Right — info */}
          <div className="flex flex-col gap-5 p-6 md:p-8 flex-1">


            {/* Title */}
            <h1
              className="text-2xl md:text-3xl leading-snug"
              style={{ fontFamily: "'Playball', cursive", color: "var(--primary)", fontWeight: 400 }}
            >
              {idea.title}
            </h1>
            {allIdeas.length > 1 && currentIndex !== -1 && (
              <p className="text-xs -mt-4" style={{ color: "var(--muted-foreground)" }}>
                {currentIndex + 1} of {allIdeas.length}
              </p>
            )}

            {/* Description */}
            {idea.description && (
              <div
                className="text-sm leading-relaxed prose prose-sm max-w-none"
                style={{ color: "var(--muted-foreground)" }}
                dangerouslySetInnerHTML={{ __html: idea.description }}
              />
            )}

            {/* Divider */}
            <div className="border-t" style={{ borderColor: "var(--border)" }} />

            {/* CTA */}
            <a
              href={`https://wa.me/+250788724867?text=${encodeURIComponent(
                `Hello Butterfly Decor, I would like to know more about this outfit: ${idea.title}\n${typeof window !== "undefined" ? window.location.origin : ""}/style-insipiration/${idea.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: "#25D366" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
              Ask about this outfit
            </a>

            <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
              Added {new Date(idea.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Related ideas */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {related.map((item, idx) => (
              <div
                key={item.id}
                className="break-inside-avoid mb-3 group cursor-pointer"
                onClick={() => goToSibling(item)}
              >
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{ aspectRatio: idx % 3 === 0 ? "3/4" : idx % 3 === 1 ? "1/1" : "4/5" }}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 px-2.5 py-2"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}
                  >
                    <p className="text-white text-base sm:text-lg font-semibold truncate" style={{ fontFamily: "Georgia, serif", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {ideasPage < ideasTotalPages && <div ref={sentinelRef} className="h-4" />}
          {loadingMore && (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 mt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`sk-${i}`} className="break-inside-avoid mb-3">
                  <div className="w-full rounded-2xl animate-pulse" style={{ background: "var(--muted)", aspectRatio: "3/4" }} />
                </div>
              ))}
            </div>
          )}
          {ideasPage >= ideasTotalPages && related.length > 0 && (
            <p className="text-center text-xs mt-4" style={{ color: "var(--muted-foreground)" }}>
              All {related.length} ideas loaded
            </p>
          )}
        </div>
      )}
    </main>
  );
}
