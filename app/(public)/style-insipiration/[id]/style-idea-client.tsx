"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLoadMore } from "@/hooks/use-load-more";
import { cldImage } from "@/lib/image";

type StyleIdea = { id: string; title: string; imageUrl: string };

export default function StyleIdeaClient({
  idea,
  allIdeas,
  page,
  hasMore,
  shareUrl,
}: {
  idea: StyleIdea & { description: string | null; createdAt: string };
  allIdeas: StyleIdea[];
  page: number;
  hasMore: boolean;
  shareUrl: string;
}) {
  const { sentinelRef, loadingMore } = useLoadMore(page, hasMore);

  const related = allIdeas.filter((i) => i.id !== idea.id);
  const currentIndex = allIdeas.findIndex((i) => i.id === idea.id);
  const prevIdea = allIdeas.length > 1 ? allIdeas[(currentIndex - 1 + allIdeas.length) % allIdeas.length] : null;
  const nextIdea = allIdeas.length > 1 ? allIdeas[(currentIndex + 1) % allIdeas.length] : null;

  // Keep the already-loaded pages when moving between ideas.
  const hrefFor = (target: StyleIdea) => `/style-insipiration/${target.id}${page > 1 ? `?page=${page}` : ""}`;

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--background)" }}>
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
              key={idea.id}
              src={cldImage(idea.imageUrl, 1000)}
              alt={idea.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 55vw"
              priority
            />
            {prevIdea && (
              <Link
                href={hrefFor(prevIdea)}
                replace
                scroll={false}
                aria-label="Previous idea"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors z-10"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </Link>
            )}
            {nextIdea && (
              <Link
                href={hrefFor(nextIdea)}
                replace
                scroll={false}
                aria-label="Next idea"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors z-10"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </Link>
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
            {allIdeas.length > 1 && (
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
                `Hello Butterfly Decor, I would like to know more about this outfit: ${idea.title}\n${shareUrl}`
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
              Added {new Date(idea.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
            </p>
          </div>
        </div>
      </div>

      {/* Related ideas */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {related.map((item, idx) => (
              <Link
                key={item.id}
                href={hrefFor(item)}
                replace
                className="block break-inside-avoid mb-3 group cursor-pointer"
              >
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{ aspectRatio: idx % 3 === 0 ? "3/4" : idx % 3 === 1 ? "1/1" : "4/5" }}
                >
                  <Image
                    src={cldImage(item.imageUrl, 600)}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 px-2.5 py-2"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}
                  >
                    <p className="text-white text-base sm:text-lg truncate" style={{ fontFamily: "Georgia, serif", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                      {item.title}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} className="h-4" />}
          {loadingMore && (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 mt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`sk-${i}`} className="break-inside-avoid mb-3">
                  <div className="w-full rounded-2xl animate-pulse" style={{ background: "var(--muted)", aspectRatio: "3/4" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
