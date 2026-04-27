"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Share2, X } from "lucide-react";

type CollectionItem = {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  categoryId: string;
  category: { id: string; name: string };
};

export default function CollectionItemDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<CollectionItem | null>(null);
  const [allItems, setAllItems] = useState<CollectionItem[]>([]);
  const [related, setRelated] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgFading, setImgFading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [shareItem, setShareItem] = useState<{ id: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const shareLink = shareItem
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/collection/${shareItem.id}`
    : "";

  const loadItem = (targetId: string, all: CollectionItem[]) => {
    const current = all.find((i) => i.id === targetId) ?? null;
    setItem(current);
    if (current) {
      const others = all.filter((i) => i.id !== targetId);
      const sameCategory = others.filter((i) => i.category.id === current.category.id);
      setRelated([...sameCategory, ...others.filter((i) => i.category.id !== current.category.id)].slice(0, 10));
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("butterfly-selected-items");
    if (saved) setSelectedItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch("/api/collection-items")
      .then((r) => r.json())
      .then((res) => {
        const all: CollectionItem[] = res.data ?? [];
        setAllItems(all);
        loadItem(id as string, all);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = prev.includes(itemId) ? prev.filter((i) => i !== itemId) : [...prev, itemId];
      localStorage.setItem("butterfly-selected-items", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("selectedItemsChange", { detail: next.length }));
      return next;
    });
  };

  const handleRelatedClick = (relatedItem: CollectionItem) => {
    // preload image so it's in cache before we swap
    const img = new window.Image();
    img.src = relatedItem.imageUrl;

    router.replace(`/collection/${relatedItem.id}`, { scroll: false });

    // fade out → swap → fade in
    setImgFading(true);
    setTimeout(() => {
      loadItem(relatedItem.id, allItems);
      setImgFading(false);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 180);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareLink)}`, "_blank");
  };

  if (loading) {
    return (
      <main className="min-h-screen pb-16" style={{ background: "var(--background)" }}>
        {/* Back button skeleton */}
        <div className="px-4 md:px-8 pt-5 pb-2">
          <div className="h-4 w-28 rounded-full animate-pulse" style={{ background: "var(--muted)" }} />
        </div>

        {/* Detail card skeleton — centered */}
        <div className="max-w-2xl mx-auto pt-4 px-4 md:px-8 w-full">
          <div
            className="flex flex-col md:flex-row overflow-hidden rounded-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <div className="w-full md:w-[46%] shrink-0 animate-pulse" style={{ minHeight: "200px", background: "var(--muted)" }} />
            <div className="flex flex-col gap-3 p-4 md:p-6 flex-1">
              <div className="h-4 w-16 rounded-full animate-pulse" style={{ background: "var(--muted)" }} />
              <div className="h-6 w-3/4 rounded-xl animate-pulse" style={{ background: "var(--muted)" }} />
              <div className="h-3 w-full rounded animate-pulse" style={{ background: "var(--muted)" }} />
              <div className="h-3 w-5/6 rounded animate-pulse" style={{ background: "var(--muted)" }} />
              <div className="border-t" style={{ borderColor: "var(--border)" }} />
              <div className="flex gap-2">
                <div className="flex-1 h-8 rounded-full animate-pulse" style={{ background: "var(--muted)" }} />
                <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: "var(--muted)" }} />
              </div>
              <div className="h-8 rounded-full animate-pulse" style={{ background: "var(--muted)" }} />
            </div>
          </div>
        </div>

        {/* Related grid skeleton */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-3">
                <div
                  className="w-full rounded-2xl animate-pulse"
                  style={{
                    background: "var(--muted)",
                    aspectRatio: i % 4 === 0 ? "3/4" : i % 4 === 1 ? "4/5" : i % 4 === 2 ? "1/1" : "3/5",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--background)" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Item not found.</p>
        <button onClick={() => router.back()} className="text-sm underline" style={{ color: "var(--primary)" }}>Go back</button>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen pb-16"
      style={{ background: "var(--background)" }}
    >
      <div ref={topRef} />

      {/* Detail card — centered, smaller */}
      <div className="max-w-2xl mx-auto pt-4 px-4 md:px-8 w-full">
        <div
          className="flex flex-col md:flex-row overflow-hidden rounded-2xl shadow-lg"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          {/* Image */}
          <div
            className="w-full md:w-[46%] shrink-0 flex items-center justify-center"
            style={{ background: "var(--muted)", minHeight: "200px", maxHeight: "340px" }}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              style={{
                width: "100%",
                height: "100%",
                maxHeight: "340px",
                objectFit: "contain",
                display: "block",
                transition: "opacity 0.18s ease",
                opacity: imgFading ? 0 : 1,
              }}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 p-4 md:p-6 flex-1">
              <span
                className="self-start text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  background: "rgba(131,81,5,0.1)",
                  color: "#835105",
                  border: "1px solid rgba(131,81,5,0.2)",
                }}
              >
                {item.category.name}
              </span>
              <h1
                className="text-2xl md:text-3xl leading-snug"
                style={{
                  fontFamily: "'Playball', cursive",
                  color: "var(--primary)",
                  fontWeight: 400,
                }}
              >
                {item.name}
              </h1>
              {item.description && (
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: "var(--muted-foreground)",
                    fontStyle: "italic",
                  }}
                >
                  {item.description}
                </p>
              )}
              <div
                className="border-t"
                style={{ borderColor: "var(--border)" }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => toggleSelection(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                  style={
                    selectedItems.includes(item.id)
                      ? {
                          background: "var(--primary)",
                          color: "var(--primary-foreground)",
                        }
                      : {
                          border: "1.5px solid var(--primary)",
                          color: "var(--primary)",
                          background: "transparent",
                        }
                  }
                >
                  <CheckCircle2 size={15} />
                  {selectedItems.includes(item.id) ? "Selected" : "Select"}
                </button>
                <button
                  onClick={() => {
                    setShareItem({ id: item.id, name: item.name });
                    setCopied(false);
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    border: "1.5px solid var(--primary)",
                    color: "var(--primary)",
                  }}
                >
                  <Share2 size={15} />
                </button>
              </div>
              <a
                href="https://wa.me/+250788724867?text=Hello%20Butterfly%20Decor%2C%20I%20love%20this%20item%20and%20would%20like%20to%20book%20it%20for%20my%20event!"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                Book this item
              </a>
          </div>
        </div>
      </div>

      {/* All related items */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4">
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {related.map((rel, idx) => (
              <div
                key={rel.id}
                className="break-inside-avoid mb-3 group cursor-pointer"
                onClick={() => handleRelatedClick(rel)}
              >
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{ aspectRatio: idx % 4 === 0 ? "3/4" : idx % 4 === 1 ? "4/5" : idx % 4 === 2 ? "1/1" : "3/5" }}
                >
                  <Image
                    src={rel.imageUrl}
                    alt={rel.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
               
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareItem && (
        <div
          className="fixed inset-0 z-50 md:inset-auto md:top-4 md:right-4"
          onClick={() => setShareItem(null)}
        >
          <div className="md:hidden absolute inset-0 bg-black/30" />
          <div
            className="relative md:static mx-4 mt-[35vh] md:mt-0 md:mx-0 rounded-2xl p-4 shadow-xl w-auto md:w-72"
            style={{ background: "#fdf6ee", border: "1px solid #57422C" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-sm font-semibold truncate max-w-[80%]"
                style={{ color: "#2b1807", fontFamily: "Georgia, serif" }}
              >
                {shareItem.name}
              </p>
              <button onClick={() => setShareItem(null)}>
                <X className="w-4 h-4" style={{ color: "#835105" }} />
              </button>
            </div>
            <div
              className="flex items-center gap-2 mb-3 rounded-lg px-3 py-2"
              style={{ background: "#f0e6d6", border: "1px solid #57422C" }}
            >
              <p
                className="text-xs truncate flex-1"
                style={{ color: "#57422C" }}
              >
                {shareLink}
              </p>
              <button
                onClick={handleCopy}
                className="text-xs px-2 py-1 rounded-md shrink-0 font-medium"
                style={{
                  background: copied ? "#2b1807" : "#3d230c",
                  color: "#e8d5b7",
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium"
              style={{ background: "#25D366", color: "white" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
