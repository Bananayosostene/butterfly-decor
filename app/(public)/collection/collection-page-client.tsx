"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Share2 } from "lucide-react";
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

type Category = { id: string; name: string };

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function getIconForCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("suit") || lower.includes("groom")) return "suits.svg";
  if (lower.includes("bridal") || lower.includes("bride")) return "bridal.svg";
  if (lower.includes("decor")) return "decor.svg";
  if (lower.includes("gift") || lower.includes("wrap")) return "gift-box.svg";
  if (lower.includes("invitation") || lower.includes("invite")) return "invitation.svg";
  return "cake.svg";
}

function SkeletonCard() {
  return (
    <div
      className="w-full animate-pulse rounded-md overflow-hidden"
      style={{ background: "#e8d5b7", marginBottom: "6px", breakInside: "avoid" }}
    >
      <div style={{ paddingBottom: "130%", background: "linear-gradient(110deg, #e8d5b7 30%, #f5ead8 50%, #e8d5b7 70%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
    </div>
  );
}

export default function CollectionPageClient({
  items,
  categories,
  activeSlug,
  page,
  hasMore,
}: {
  items: CollectionItem[];
  categories: Category[];
  activeSlug: string;
  page: number;
  hasMore: boolean;
}) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [shareItem, setShareItem] = useState<{ id: string; name: string } | null>(null);
  const { sentinelRef, loadingMore } = useLoadMore(page, hasMore);

  useEffect(() => {
    setSelectedItems(readSelectedIds());
  }, []);

  const toggleSelection = (item: CollectionItem) => {
    const next = selectedItems.includes(item.id)
      ? selectedItems.filter((i) => i !== item.id)
      : [...selectedItems, item.id];
    rememberSelectedLabel(item.id, item.category.name);
    setSelectedItems(next);
    writeSelectedIds(next);
  };

  const filterTabs = [
    { slug: "all", label: "All", icon: "all.svg" },
    ...categories.map((cat) => ({
      slug: slugify(cat.name),
      label: cat.name,
      icon: getIconForCategory(cat.name),
    })),
  ];

  const activeCategoryLabel = filterTabs.find((t) => t.slug === activeSlug)?.label ?? activeSlug;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <section className="pt-8 pb-0 md:pb-4 px-4 w-full">
        <div className="text-left sm:text-center">
          <h1
            className="text-3xl md:text-4xl mb-2"
            style={{ fontFamily: "'Playball', cursive", color: "var(--primary)" }}
          >
            Butterfly Collections
          </h1>
        </div>
      </section>

      <section className="pb-2 px-4 w-full">
        <div className="max-w-6xl mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 w-max px-2 lg:w-full lg:justify-center">
            {filterTabs.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.slug === "all" ? "/collection" : `/collection?cat=${cat.slug}`}
                className={`group flex flex-col items-center gap-2 shrink-0 transition-all ${
                  activeSlug === cat.slug ? "opacity-100" : "opacity-60 hover:opacity-100"
                }`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
                  <img
                    src={`/${cat.icon}`}
                    alt={cat.label}
                    className={`w-full h-full object-contain rounded-full transition-all group-hover:border-4 group-hover:border-primary ${
                      activeSlug === cat.slug ? "border-4 border-primary" : "border-2 border-primary/50"
                    }`}
                  />
                </div>
                <span
                  className={`text-xs sm:text-sm text-foreground text-center whitespace-nowrap ${
                    activeSlug === cat.slug ? "font-bold" : "font-medium"
                  }`}
                >
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-4 sm:py-5 md:py-6 lg:py-8 px-1 pb-16 w-full">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium" style={{ color: "var(--muted-foreground)" }}>
              No items found in{" "}
              <span style={{ color: "var(--primary)" }}>{activeCategoryLabel}</span>.
            </p>
            <Link
              href="/collection"
              className="mt-4 text-sm underline inline-block"
              style={{ color: "var(--primary)" }}
            >
              View all collections
            </Link>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-1.5">
            {items.map((item, i) => {
              const selected = selectedItems.includes(item.id);
              return (
                <div key={item.id} style={{ breakInside: "avoid", marginBottom: "6px" }}>
                  <Link
                    href={`/collection/${item.id}`}
                    className="relative overflow-hidden group cursor-pointer w-full block"
                  >
                    <img
                      src={cldImage(item.imageUrl, 600)}
                      alt={item.name}
                      className="w-full h-auto block"
                      loading={i < 4 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelection(item); }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md cursor-pointer ${
                          selected ? "bg-primary" : "bg-black/60"
                        }`}
                      >
                        <CheckCircle2 className={`h-4 w-4 ${selected ? "text-primary-foreground" : "text-white"}`} />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShareItem({ id: item.id, name: item.name }); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-md bg-black/60"
                      >
                        <Share2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                    <div
                      className="absolute bottom-0 left-0 right-0 px-2.5 py-2"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}
                    >
                      <p className="text-white text-base sm:text-lg truncate" style={{ fontFamily: "Georgia, serif", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{item.name}</p>
                    </div>
                  </Link>
                </div>
              );
            })}

            {/* Skeleton cards while loading more */}
            {loadingMore &&
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={`sk-${i}`} />
              ))}
          </div>
        )}

        {/* Sentinel for IntersectionObserver */}
        {hasMore && <div ref={sentinelRef} className="h-4" />}

        {shareItem && <ShareModal item={shareItem} onClose={() => setShareItem(null)} />}
      </section>
    </div>
  );
}
