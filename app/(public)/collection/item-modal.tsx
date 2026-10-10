"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, X } from "lucide-react";
import { ShareModal } from "@/components/share-modal";
import { cldImage } from "@/lib/image";
import { displaySerif } from "@/lib/fonts";
import { readSelectedIds, writeSelectedIds, rememberSelectedLabel } from "@/lib/selection";
import { ItemComments, type ItemComment } from "./item-comments";

type Item = {
  id: string;
  name: string;
  imageUrl: string;
  categoryId: string;
  description: string | null;
  category: { id: string; name: string };
};

const INK = "var(--ink)";

export type ModalSocial = { likeCount: number; liked: boolean; commentCount: number; comments: ItemComment[] };

export type ItemModalData = {
  item: Item;
  prevId: string | null;
  nextId: string | null;
  social: ModalSocial;
  canModerate: boolean;
  categoryHref: string;
};

/**
 * Gallery popup: the image on the left, its title, likes, comments and actions on the right.
 * It receives everything from the gallery, which got it from the server page: it fetches nothing.
 */
export default function ItemModal({
  item,
  prevId,
  nextId,
  social,
  canModerate,
  categoryHref,
  onNavigate,
  onSocialChange,
}: ItemModalData & {
  /** Show another item (prev/next), or close the popup with null. */
  onNavigate: (itemId: string | null) => void;
  /** Keeps likes and comments in the gallery, so reopening the image shows them. */
  onSocialChange: (itemId: string, patch: Partial<ModalSocial>) => void;
}) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [like, setLike] = useState({ liked: social.liked, count: social.likeCount });
  const [likePending, setLikePending] = useState(false);
  const [commentCount, setCommentCount] = useState(social.commentCount);

  // Guard against a second call (e.g. a click that reaches both the × button and the backdrop).
  const closing = useRef(false);
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    onNavigate(null);
  };

  useEffect(() => {
    setSelectedItems(readSelectedIds());
    // Keep the gallery behind the popup from scrolling, and let Escape and the arrow keys work.
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft" && prevId) onNavigate(prevId);
      if (e.key === "ArrowRight" && nextId) onNavigate(nextId);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevId, nextId]);

  const isSelected = selectedItems.includes(item.id);
  const setSelection = (next: string[]) => {
    rememberSelectedLabel(item.id, item.category.name);
    setSelectedItems(next);
    writeSelectedIds(next);
  };
  const toggleSelection = () =>
    setSelection(isSelected ? selectedItems.filter((i) => i !== item.id) : [...selectedItems, item.id]);
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
      const settled = res.ok ? json.data : before;
      setLike(settled);
      onSocialChange(item.id, { liked: settled.liked, likeCount: settled.count });
    } catch {
      setLike(before);
    } finally {
      setLikePending(false);
    }
  };

  const arrowClass =
    "absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center md:p-6"
      style={{ background: "rgba(20,14,8,0.82)" }}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        aria-label="Close"
        className="absolute top-3 right-3 md:top-5 md:right-5 z-10 w-11 h-11 rounded-full flex items-center justify-center shadow-md cursor-pointer"
        style={{ background: "var(--cream)", color: INK }}
      >
        <X size={18} />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-full md:h-[88vh] max-w-6xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden md:rounded-2xl shadow-2xl"
        style={{ background: "#fbf7f2" }}
      >
        {/* Image */}
        <div className="relative shrink-0 md:shrink md:flex-1 h-[55vh] md:h-auto flex items-center justify-center" style={{ background: "#1a120b" }}>
          <img
            key={item.id}
            src={cldImage(item.imageUrl, 1400)}
            alt={item.name}
            className="max-w-full max-h-full object-contain"
          />
          {prevId && (
            <button onClick={() => onNavigate(prevId)} aria-label="Previous image" className={`${arrowClass} left-3 cursor-pointer`} style={{ background: "var(--cream)", color: INK }}>
              <ChevronLeft size={20} />
            </button>
          )}
          {nextId && (
            <button onClick={() => onNavigate(nextId)} aria-label="Next image" className={`${arrowClass} right-3 cursor-pointer`} style={{ background: "var(--cream)", color: INK }}>
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Details */}
        <aside className="w-full md:w-[380px] shrink-0 md:overflow-y-auto p-5 md:p-6">
          <Link
            href={categoryHref}
            className="inline-block text-xs font-medium px-2.5 py-1 rounded-full hover:opacity-80"
            style={{ background: "rgba(43,24,7,0.07)", color: "#57422C" }}
          >
            {item.category.name}
          </Link>
          <h2 className={`${displaySerif.className} mt-2 text-2xl md:text-3xl leading-tight`} style={{ color: INK }}>
            {item.name}
          </h2>

          <div className="mt-4 flex items-center gap-2">
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
              <Heart size={16} fill={like.liked ? "currentColor" : "none"} />
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
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={toggleSelection}
              className="flex items-center justify-center gap-1.5 h-10 rounded-full text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90"
              style={
                isSelected
                  ? { background: INK, color: "var(--cream)" }
                  : { border: `1px solid ${INK}`, color: INK }
              }
            >
              <CheckCircle2 size={15} />
              {isSelected ? "Selected" : "Select"}
            </button>
            <button
              onClick={handleBookNow}
              className="h-10 rounded-full text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: INK, color: "var(--cream)" }}
            >
              Book
            </button>
          </div>

          {item.description && (
            <div
              className="mt-5 text-sm leading-relaxed prose prose-sm max-w-none"
              style={{ color: "var(--muted-foreground)" }}
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          )}

          <ItemComments
            itemId={item.id}
            initialComments={social.comments}
            initialCount={social.commentCount}
            canModerate={canModerate}
            onChange={(comments, count) => {
              setCommentCount(count);
              onSocialChange(item.id, { comments, commentCount: count });
            }}
          />
        </aside>
      </div>

      {shareOpen && (
        // Clicks inside the share box must not reach the backdrop, which would close the popup.
        <div onClick={(e) => e.stopPropagation()}>
          <ShareModal item={item} onClose={() => setShareOpen(false)} />
        </div>
      )}
    </div>
  );
}
