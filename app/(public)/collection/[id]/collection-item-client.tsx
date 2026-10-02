"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2, Share2 } from "lucide-react";
import { ShareModal } from "@/components/share-modal";
import { useLoadMore } from "@/hooks/use-load-more";
import { cldImage } from "@/lib/image";
import { readSelectedIds, writeSelectedIds, rememberSelectedLabel } from "@/lib/selection";

type CollectionItem = {
  id: string;
  name: string;
  imageUrl: string;
  categoryId: string;
  category: { id: string; name: string };
};

export default function CollectionItemClient({
  item,
  categoryItems,
  page,
  hasMore,
}: {
  item: CollectionItem & { description: string | null };
  categoryItems: CollectionItem[];
  page: number;
  hasMore: boolean;
}) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const { sentinelRef, loadingMore } = useLoadMore(page, hasMore);

  useEffect(() => {
    setSelectedItems(readSelectedIds());
  }, []);

  const related = categoryItems.filter((i) => i.id !== item.id);
  const currentIndex = categoryItems.findIndex((i) => i.id === item.id);
  const prevItem = categoryItems.length > 1 && currentIndex !== -1 ? categoryItems[(currentIndex - 1 + categoryItems.length) % categoryItems.length] : null;
  const nextItem = categoryItems.length > 1 && currentIndex !== -1 ? categoryItems[(currentIndex + 1) % categoryItems.length] : null;

  // Keep the already-loaded pages when moving between items of the same category.
  const hrefFor = (target: CollectionItem) => `/collection/${target.id}${page > 1 ? `?page=${page}` : ""}`;

  const isSelected = selectedItems.includes(item.id);

  const setSelection = (next: string[]) => {
    rememberSelectedLabel(item.id, item.category.name);
    setSelectedItems(next);
    writeSelectedIds(next);
  };

  const toggleSelection = () => {
    setSelection(isSelected ? selectedItems.filter((i) => i !== item.id) : [...selectedItems, item.id]);
  };

  const handleBookNow = () => {
    if (!isSelected) setSelection([...selectedItems, item.id]);
    window.dispatchEvent(new CustomEvent("openBookingModal"));
  };

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: "var(--background)" }}
    >
      {/* Detail card — centered, smaller */}
      <div className="max-w-2xl mx-auto pt-4 px-4 md:px-8 w-full">
        <div
          className="flex flex-col md:flex-row overflow-hidden rounded-2xl shadow-lg"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          {/* Image */}
          <div
            className="relative w-full md:w-[46%] shrink-0 flex items-center justify-center"
            style={{ background: "var(--muted)", minHeight: "200px", maxHeight: "340px" }}
          >
            <img
              key={item.id}
              src={cldImage(item.imageUrl, 800)}
              alt={item.name}
              fetchPriority="high"
              style={{
                width: "100%",
                height: "100%",
                maxHeight: "340px",
                objectFit: "contain",
                display: "block",
              }}
            />
            {prevItem && (
              <Link
                href={hrefFor(prevItem)}
                replace
                scroll={false}
                aria-label="Previous item"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </Link>
            )}
            {nextItem && (
              <Link
                href={hrefFor(nextItem)}
                replace
                scroll={false}
                aria-label="Next item"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </Link>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col pt-2 px-4 pb-2 md:pt-4 md:px-6 md:pb-3 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 ">
              <h1
                className="text-xl md:text-2xl leading-snug "
                style={{
                  fontFamily: "'Playball', cursive",
                  color: "var(--primary)",
                  fontWeight: 400,
                }}
              >
                {item.name}
              </h1>
            </div>
            {categoryItems.length > 1 && currentIndex !== -1 && (
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {currentIndex + 1} of {categoryItems.length} in {item.category.name}
              </p>
            )}
            {item.description && (
              <div
                className="text-sm leading-relaxed mt-1 prose prose-sm max-w-none"
                style={{ color: "var(--muted-foreground)" }}
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            )}

            <div className="flex items-center justify-center gap-2 mt-auto pt-4">
              <button
                onClick={toggleSelection}
                className="flex items-center justify-center gap-2 px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-opacity cursor-pointer hover:opacity-90"
                style={
                  isSelected
                    ? {
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }
                    : {
                      border: "1px solid var(--primary)",
                      color: "var(--primary)",
                      background: "transparent",
                    }
                }
              >
                <CheckCircle2 size={13} />
                {isSelected ? "Selected" : "Select"}
              </button>
              <button
                onClick={() => setShareOpen(true)}
                className="w-10 h-7 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
                style={{
                  border: "1px solid var(--primary)",
                  color: "var(--primary)",
                }}
              >
                <Share2 size={13} />
              </button>
              <button
                type="button"
                onClick={handleBookNow}
                className="flex items-center justify-center gap-2 px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-opacity hover:opacity-90 cursor-pointer"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Book
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* All related items */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4">
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-2">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={hrefFor(rel)}
                replace
                className="block break-inside-avoid mb-2 group cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={cldImage(rel.imageUrl, 600)}
                    alt={rel.name}
                    className="w-full h-auto block"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  <div
                    className="absolute bottom-0 left-0 right-0 px-2.5 py-2"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}
                  >
                    <p className="text-white text-base sm:text-lg truncate" style={{ fontFamily: "Georgia, serif", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                      {rel.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} className="h-4" />}
          {loadingMore && (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 mt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`sk-${i}`} className="break-inside-avoid mb-2">
                  <div className="w-full rounded-2xl animate-pulse" style={{ background: "var(--muted)", aspectRatio: "3/4" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {shareOpen && <ShareModal item={item} onClose={() => setShareOpen(false)} />}
    </div>
  );
}
