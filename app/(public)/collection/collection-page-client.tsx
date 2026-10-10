"use client";

import { useState } from "react";
import Link, { useLinkStatus } from "next/link";
import { HoverPrefetchLink } from "@/components/hover-prefetch-link";
import ItemModal, { type ModalSocial } from "./item-modal";
import { categoryHref } from "@/lib/category-icons";
import type { ItemSocial } from "@/lib/data";
import { useLoadMore } from "@/hooks/use-load-more";
import { cldImage } from "@/lib/image";
import { displaySerif } from "@/lib/fonts";

type CollectionItem = {
  id: string;
  name: string;
  imageUrl: string;
  categoryId: string;
  description: string | null;
  category: { id: string; name: string; kind: string | null };
};

/** One filter tab, built by the server page (label, icon file and where it links to). */
export type FilterTab = { key: string; label: string; icon: string; href: string; active: boolean };

export type Crumb = { label: string; href?: string };

const INK = "#2b1807";
/** Images shown before the visitor opens the whole gallery with the "+N" tile. */
const PREVIEW_COUNT = 5;

/** Likes and comments made in the popup. Kept outside the component so they survive switching filters. */
const socialMemory: Record<string, Partial<ModalSocial>> = {};

/** A ring around the filter icon while its page is on the way. */
function TabPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <span className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" aria-label="Loading" />;
}

function TabRow({ tabs }: { tabs: FilterTab[] }) {
  return (
    <div className="max-w-6xl mx-auto overflow-x-auto scrollbar-hide">
      <div className="flex gap-6 w-max px-2 lg:w-full lg:justify-center">
        {tabs.map((tab) => (
          <HoverPrefetchLink
            key={tab.key}
            href={tab.href}
            className={`group flex flex-col items-center gap-2 shrink-0 transition-all ${
              tab.active ? "opacity-100" : "opacity-60 hover:opacity-100"
            }`}
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
              <TabPending />
              <img
                src={`/${tab.icon}`}
                alt={tab.label}
                className={`w-full h-full object-contain rounded-full transition-all group-hover:border-4 group-hover:border-primary ${
                  tab.active ? "border-4 border-primary" : "border-2 border-primary/50"
                }`}
              />
            </div>
            <span
              className={`text-xs sm:text-sm text-foreground text-center whitespace-nowrap ${
                tab.active ? "font-bold" : "font-medium"
              }`}
            >
              {tab.label}
            </span>
          </HoverPrefetchLink>
        ))}
      </div>
    </div>
  );
}

/**
 * Album-style gallery: images come in blocks of five — one large photo with four smaller ones
 * beside it (under it on phones). Clicking a tile opens it in the popup.
 */
function GalleryBlocks({
  items,
  moreCount,
  onShowAll,
  onOpen,
}: {
  items: CollectionItem[];
  onOpen: (itemId: string) => void;
  /** When set, the last tile shows "+N" and opens the full gallery instead of the image. */
  moreCount?: number;
  onShowAll?: () => void;
}) {
  const blocks: CollectionItem[][] = [];
  for (let i = 0; i < items.length; i += PREVIEW_COUNT) blocks.push(items.slice(i, i + PREVIEW_COUNT));

  return (
    <div className="space-y-2">
      {blocks.map((block, b) => (
        <div key={block[0].id} className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {block.map((item, i) => {
            const big = i === 0;
            const isMoreTile = moreCount !== undefined && b === blocks.length - 1 && i === block.length - 1;
            const image = (
              <>
                <img
                  src={cldImage(item.imageUrl, big ? 1100 : 550)}
                  alt={item.name}
                  loading={b === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                {isMoreTile ? (
                  <span
                    className={`${displaySerif.className} absolute inset-0 flex items-center justify-center text-4xl md:text-5xl text-white`}
                    style={{ background: "rgba(43,24,7,0.55)" }}
                  >
                    +{moreCount}
                  </span>
                ) : (
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                )}
              </>
            );
            // The big tile takes its height from the two rows of small tiles next to it; on phones
            // nothing sits beside it, so it keeps a square shape of its own.
            const tileClass = `group relative block overflow-hidden rounded-md ${
              big ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square"
            }`;
            const tileStyle = { background: "rgba(43,24,7,0.06)" };

            return isMoreTile ? (
              <button
                key={item.id}
                type="button"
                onClick={onShowAll}
                className={`${tileClass} cursor-pointer`}
                style={tileStyle}
                aria-label={`Show ${moreCount} more images`}
              >
                {image}
              </button>
            ) : (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpen(item.id)}
                className={`${tileClass} cursor-pointer`}
                style={tileStyle}
                aria-label={item.name}
              >
                {image}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function CollectionPageClient({
  social,
  likedIds,
  canModerate,
  sharedItem,
  initialItemId,
  items,
  total,
  tabs,
  breadcrumb,
  title,
  description,
  inDecor = false,
  page,
  hasMore,
}: {
  /** Likes and comments of every item below, loaded by the server page with the gallery. */
  social: Record<string, ItemSocial>;
  /** Items this visitor has liked. */
  likedIds: string[];
  canModerate: boolean;
  /** Item from a shared `?item=` link that is not among `items`. */
  sharedItem: CollectionItem | null;
  /** Item to show in the popup on arrival (from a shared link). */
  initialItemId: string | null;
  items: CollectionItem[];
  /** Number of images in this view, including those not loaded yet. */
  total: number;
  tabs: FilterTab[];
  breadcrumb: Crumb[];
  title: string;
  description: string;
  /** True on /collection?cat=decor: shows a way back to the full collection. */
  inDecor?: boolean;
  page: number;
  hasMore: boolean;
}) {
  // Coming back with ?page=2+ means the visitor had already opened the full gallery.
  const [showAll, setShowAll] = useState(page > 1);
  const { sentinelRef, loadingMore } = useLoadMore(page, showAll && hasMore);

  // The popup is plain page state: everything it shows was sent with the gallery, so opening,
  // moving between and closing images makes no request and the address stays the same.
  const [openId, setOpenId] = useState<string | null>(initialItemId);
  // Likes and comments made in the popup, so reopening an image shows them.
  const [socialChanges, setSocialChanges] = useState<Record<string, Partial<ModalSocial>>>(() => ({ ...socialMemory }));

  const showItem = (itemId: string | null) => {
    setOpenId(itemId);
    // A shared link arrived with ?item=…; once closed, tidy the address without reloading.
    if (!itemId && window.location.search.includes("item=")) {
      const params = new URLSearchParams(window.location.search);
      params.delete("item");
      const query = params.toString();
      window.history.replaceState(null, "", query ? `/collection?${query}` : "/collection");
    }
  };

  const updateSocial = (itemId: string, patch: Partial<ModalSocial>) => {
    socialMemory[itemId] = { ...socialMemory[itemId], ...patch };
    setSocialChanges({ ...socialMemory });
  };

  // Prev/next walk through the images of this view (wrapping at the ends).
  const viewItems = sharedItem ? [...items, sharedItem] : items;
  const openIndex = openId ? viewItems.findIndex((i) => i.id === openId) : -1;
  const openItem = openIndex === -1 ? null : viewItems[openIndex];
  const neighbour = (step: number) =>
    viewItems.length > 1 ? viewItems[(openIndex + step + viewItems.length) % viewItems.length].id : null;

  const preview = items.slice(0, PREVIEW_COUNT);
  const hiddenCount = total - preview.length;

  return (
    <div className="min-h-screen pb-20" style={{ background: "#fbf7f2" }}>
      <section className="pt-8 pb-2 px-4 w-full space-y-4">
        {inDecor && (
          <div className="max-w-6xl mx-auto flex justify-center">
            <Link href="/collection" className="text-xs font-semibold uppercase tracking-[0.15em] hover:underline" style={{ color: "var(--muted-foreground)" }}>
              ← All wedding collections
            </Link>
          </div>
        )}
        <TabRow tabs={tabs} />
      </section>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* Where we are, e.g. Wedding / Decor / Bridal Shower */}
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex flex-wrap items-center gap-1.5">
            {breadcrumb.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <span style={{ color: "var(--muted-foreground)" }}>/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:underline" style={{ color: "#a0566c" }}>{crumb.label}</Link>
                ) : (
                  <span style={{ color: INK }}>{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className={`${displaySerif.className} mt-3 text-2xl md:text-3xl leading-[1.08] max-w-2xl`} style={{ color: INK }}>
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed" style={{ color: "#57422C" }}>{description}</p>
        )}

        <div className="mt-6">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-medium" style={{ color: "var(--muted-foreground)" }}>
                No images in <span style={{ color: INK }}>{title}</span> yet.
              </p>
              <Link href="/collection" className="mt-4 text-sm underline inline-block" style={{ color: INK }}>
                View all wedding collections
              </Link>
            </div>
          ) : showAll ? (
            <>
              <GalleryBlocks items={items} onOpen={showItem} />
              {hasMore && <div ref={sentinelRef} className="h-4" />}
              {loadingMore && (
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-md animate-pulse" style={{ background: "rgba(43,24,7,0.08)" }} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <GalleryBlocks
              items={preview}
              moreCount={hiddenCount > 0 ? hiddenCount : undefined}
              onShowAll={() => setShowAll(true)}
              onOpen={showItem}
            />
          )}
        </div>
      </div>

      {openItem && (
        <ItemModal
          key={openItem.id}
          item={openItem}
          prevId={neighbour(-1)}
          nextId={neighbour(1)}
          social={{
            // The server page sends an entry for every item in the view.
            ...social[openItem.id],
            liked: likedIds.includes(openItem.id),
            ...socialChanges[openItem.id],
          }}
          canModerate={canModerate}
          categoryHref={categoryHref(openItem.category)}
          onNavigate={showItem}
          onSocialChange={updateSocial}
        />
      )}
    </div>
  );
}
