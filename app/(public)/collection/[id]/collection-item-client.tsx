"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2, Heart, MessageCircle, Share2 } from "lucide-react";
import { ShareModal } from "@/components/share-modal";
import { useLoadMore } from "@/hooks/use-load-more";
import { cldImage } from "@/lib/image";
import { readSelectedIds, writeSelectedIds, rememberSelectedLabel } from "@/lib/selection";
import { ItemComments, type ItemComment } from "./item-comments";

type CollectionItem = {
  id: string;
  name: string;
  imageUrl: string;
  categoryId: string;
  category: { id: string; name: string };
};

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function CollectionItemClient({
  item,
  feed,
  prevId,
  nextId,
  page,
  hasMore,
  social,
  canModerate,
}: {
  item: CollectionItem & { description: string | null };
  feed: CollectionItem[];
  prevId: string | null;
  nextId: string | null;
  page: number;
  hasMore: boolean;
  social: { likeCount: number; liked: boolean; commentCount: number; comments: ItemComment[] };
  canModerate: boolean;
}) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [like, setLike] = useState({ liked: social.liked, count: social.likeCount });
  const [likePending, setLikePending] = useState(false);
  const [commentCount, setCommentCount] = useState(social.commentCount);
  const { sentinelRef, loadingMore } = useLoadMore(page, hasMore);

  useEffect(() => {
    setSelectedItems(readSelectedIds());
  }, []);

  // Keep the already-loaded pages when moving between items.
  const hrefFor = (id: string) => `/collection/${id}${page > 1 ? `?page=${page}` : ""}`;

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

  const toggleLike = async () => {
    if (likePending) return;
    const before = like;
    // Show the result straight away, then settle on what the server says.
    setLike({ liked: !before.liked, count: Math.max(0, before.count + (before.liked ? -1 : 1)) });
    setLikePending(true);
    try {
      const res = await fetch(`/api/collection-items/${item.id}/like`, { method: "POST" });
      const json = await res.json();
      setLike(res.ok ? json.data : before);
    } catch {
      setLike(before);
    } finally {
      setLikePending(false);
    }
  };

  // Four columns: two beside the item (right) and two underneath it (left). The right pair starts
  // at the top of the page, so it takes a head start of images roughly as tall as the item panel;
  // after that, images are dealt out to all four columns in turn.
  const headStart = 2 * (3 + Math.ceil(social.comments.length / 4));
  const columns: CollectionItem[][] = [[], [], [], []];
  feed.forEach((rel, i) => {
    const column = i < headStart ? 2 + (i % 2) : [2, 3, 0, 1][(i - headStart) % 4];
    columns[column].push(rel);
  });

  const renderColumn = (items: CollectionItem[]) => (
    <div className="flex flex-col gap-2 min-w-0">
      {items.map((rel) => (
        <Link key={rel.id} href={hrefFor(rel.id)} replace className="block group">
          <div className="relative overflow-hidden rounded-xl" style={{ background: "var(--muted)" }}>
            <img
              src={cldImage(rel.imageUrl, 500)}
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
              <p className="text-white text-sm sm:text-base truncate" style={{ fontFamily: "Georgia, serif", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                {rel.name}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto pt-4 px-3 md:px-6 grid grid-cols-1 md:grid-cols-2 md:gap-x-4 items-start">
        {/* LEFT — the viewed item and everything about it, then more images so no space is left empty.
            On phones the wrapper dissolves so the order is: item, related images, remaining images. */}
        <div className="contents md:block min-w-0">
        <article className="order-1 md:order-none min-w-0">
          <div
            className="relative overflow-hidden rounded-2xl flex items-center justify-center"
            style={{ background: "var(--muted)", border: "1px solid var(--card-border)" }}
          >
            <img
              src={cldImage(item.imageUrl, 1000)}
              alt={item.name}
              fetchPriority="high"
              className="block w-full h-auto max-h-[80vh] object-contain"
            />
            {prevId && (
              <Link
                href={hrefFor(prevId)}
                replace
                scroll={false}
                aria-label="Previous item"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </Link>
            )}
            {nextId && (
              <Link
                href={hrefFor(nextId)}
                replace
                scroll={false}
                aria-label="Next item"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </Link>
            )}
          </div>

          <div className="mt-4 px-1">
            <Link
              href={`/collection?cat=${slugify(item.category.name)}`}
              className="inline-block text-xs font-medium px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              {item.category.name}
            </Link>
            <h1
              className="mt-2 text-2xl md:text-3xl leading-snug"
              style={{ fontFamily: "'Playball', cursive", color: "var(--primary)", fontWeight: 400 }}
            >
              {item.name}
            </h1>

            {/* Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={toggleLike}
                aria-pressed={like.liked}
                aria-label={like.liked ? "Unlike" : "Like"}
                className="flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-semibold cursor-pointer transition-colors"
                style={
                  like.liked
                    ? { background: "#fde8ea", color: "#c81e3a", border: "1px solid #f5b5be" }
                    : { border: "1px solid var(--border)", color: "var(--foreground)" }
                }
              >
                <Heart size={16} fill={like.liked ? "currentColor" : "none"} className="transition-transform active:scale-125" />
                {like.count}
              </button>
              <a
                href="#comments"
                aria-label="Go to comments"
                className="flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-semibold"
                style={{ border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                <MessageCircle size={16} />
                {commentCount}
              </a>
              <button
                onClick={() => setShareOpen(true)}
                aria-label="Share"
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                style={{ border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                <Share2 size={15} />
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={toggleSelection}
                  className="flex items-center justify-center gap-1.5 px-4 h-9 rounded-full text-sm font-semibold whitespace-nowrap transition-opacity cursor-pointer hover:opacity-90"
                  style={
                    isSelected
                      ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                      : { border: "1px solid var(--primary)", color: "var(--primary)", background: "transparent" }
                  }
                >
                  <CheckCircle2 size={14} />
                  {isSelected ? "Selected" : "Select"}
                </button>
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="flex items-center justify-center gap-1.5 px-4 h-9 rounded-full text-sm font-semibold whitespace-nowrap transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Book
                </button>
              </div>
            </div>

            {item.description && (
              <div
                className="mt-4 text-sm leading-relaxed prose prose-sm max-w-none"
                style={{ color: "var(--muted-foreground)" }}
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            )}

            <ItemComments
              itemId={item.id}
              initialComments={social.comments}
              initialCount={social.commentCount}
              canModerate={canModerate}
              onCountChange={setCommentCount}
            />
          </div>
        </article>
        <div className="order-3 md:order-none mt-2 md:mt-6 grid grid-cols-2 gap-2 items-start">
          {renderColumn(columns[0])}
          {renderColumn(columns[1])}
        </div>
        </div>

        {/* RIGHT — same category first, then the rest of the collection */}
        <aside className="order-2 md:order-none min-w-0 mt-6 md:mt-0 grid grid-cols-2 gap-2 items-start">
          {renderColumn(columns[2])}
          {renderColumn(columns[3])}
        </aside>
      </div>

      {hasMore && <div ref={sentinelRef} className="h-4" />}
      {loadingMore && (
        <div className="max-w-7xl mx-auto px-3 md:px-6 mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: "var(--muted)" }} />
          ))}
        </div>
      )}

      {shareOpen && <ShareModal item={item} onClose={() => setShareOpen(false)} />}
    </div>
  );
}
