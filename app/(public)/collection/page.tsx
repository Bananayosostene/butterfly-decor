"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Share2, X } from "lucide-react";

type CollectionItem = {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  categoryId: string;
  category: { id: string; name: string };
};

type Category = { id: string; name: string; description?: string; imageUrl?: string };

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

// Map category name to icon by keyword matching
function getIconForCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("suit") || lower.includes("groom")) return "suits.svg";
  if (lower.includes("bridal") || lower.includes("bride")) return "bridal.svg";
  if (lower.includes("decor")) return "decor.svg";
  if (lower.includes("gift") || lower.includes("wrap")) return "gift-box.svg";
  if (lower.includes("invitation") || lower.includes("invite")) return "invitation.svg";
  return "cake.svg"; // default for "other"
}

function CollectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("cat") ?? "all";

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [allItems, setAllItems] = useState<CollectionItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shareItem, setShareItem] = useState<{ id: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [colCount, setColCount] = useState(3);

  const shareLink = shareItem
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/collection/${shareItem.id}`
    : "";

  useEffect(() => {
    const saved = localStorage.getItem("butterfly-selected-items");
    if (saved) setSelectedItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/collection-items").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([itemsRes, catsRes]) => {
      setAllItems(itemsRes.data ?? []);
      setCategories(catsRes.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("butterfly-selected-items", JSON.stringify(selectedItems));
    window.dispatchEvent(new CustomEvent("selectedItemsChange", { detail: selectedItems.length }));
  }, [selectedItems]);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setColCount(2);
      else if (window.innerWidth < 1024) setColCount(3);
      else setColCount(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareLink)}`, "_blank");
  };

  const handleFilterClick = (slug: string) => {
    if (slug === "all") router.push("/collection");
    else router.push(`/collection?cat=${slug}`);
  };

  // Filter items by active slug
  const displayedItems =
    activeSlug === "all"
      ? allItems
      : allItems.filter((item) => slugify(item.category.name) === activeSlug);

  // Build filter tabs: "All" + all DB categories with their icons
  const filterTabs = [
    { slug: "all", label: "All", icon: "all.svg" },
    ...categories.map((cat) => ({
      slug: slugify(cat.name),
      label: cat.name,
      icon: getIconForCategory(cat.name),
    })),
  ];

  const activeCategoryLabel =
    activeSlug === "all"
      ? "All"
      : categories.find((c) => slugify(c.name) === activeSlug)?.name ?? activeSlug;

  return (
    <main className="min-h-screen bg-background flex flex-col items-center">
      {/* Header */}
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

      {/* Category filters */}
      <section className="pb-2 px-4 w-full">
        <div className="max-w-6xl mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 w-max px-2 lg:w-full lg:justify-center">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                    <div className="rounded-full animate-pulse w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" style={{ background: "var(--muted)" }} />
                    <div className="rounded animate-pulse h-2.5 w-12" style={{ background: "var(--muted)" }} />
                  </div>
                ))
              : filterTabs.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleFilterClick(cat.slug)}
                    className={`flex flex-col items-center gap-2 shrink-0 transition-all ${
                      activeSlug === cat.slug ? "opacity-100" : "opacity-60 hover:opacity-80"
                    }`}
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
                      <img
                        src={`/${cat.icon}`}
                        alt={cat.label}
                        className="w-full h-full object-contain border-2 border-primary/50 rounded-full"
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground text-center whitespace-nowrap">
                      {cat.label}
                    </span>
                  </button>
                ))}
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="py-4 sm:py-5 md:py-6 lg:py-8 px-1 pb-16 w-full">
        {loading ? (
          <div style={{ columnCount: colCount, columnGap: "6px" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ breakInside: "avoid", marginBottom: "6px" }}>
                <div
                  className="w-full rounded animate-pulse"
                  style={{
                    background: "var(--muted)",
                    aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/5",
                  }}
                />
              </div>
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium" style={{ color: "var(--muted-foreground)" }}>
              No items found in{" "}
              <span style={{ color: "var(--primary)" }}>{activeCategoryLabel}</span>.
            </p>
            <button
              onClick={() => router.push("/collection")}
              className="mt-4 text-sm underline"
              style={{ color: "var(--primary)" }}
            >
              View all collections
            </button>
          </div>
        ) : (
          <div style={{ columnCount: colCount, columnGap: "6px" }}>
            {displayedItems.map((item) => (
              <div key={item.id} style={{ breakInside: "avoid", marginBottom: "6px" }}>
                <div
                  className="relative overflow-hidden group cursor-pointer w-full"
                  onClick={() => router.push(`/collection/${item.id}`)}
                >
                  <img src={item.imageUrl} alt={item.name} className="w-full h-auto block" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md cursor-pointer ${
                        selectedItems.includes(item.id) ? "bg-primary" : "bg-black/60"
                      }`}
                    >
                      <CheckCircle2 className={`h-4 w-4 ${selectedItems.includes(item.id) ? "text-primary-foreground" : "text-white"}`} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShareItem({ id: item.id, name: item.name }); setCopied(false); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-md bg-black/60"
                    >
                      <Share2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <div
                    className="absolute bottom-0 left-0 right-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
                  >
                    <p className="text-white text-xs font-medium truncate" style={{ fontFamily: "Georgia, serif" }}>{item.name}</p>
                    <p className="text-white/70 text-[10px] truncate" style={{ fontFamily: "Georgia, serif" }}>{item.category.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Share Modal */}
        {shareItem && (
          <div className="fixed inset-0 z-50 md:inset-auto md:top-4 md:right-4" onClick={() => setShareItem(null)}>
            <div className="md:hidden absolute inset-0 bg-black/30" />
            <div
              className="relative md:static mx-4 mt-[35vh] md:mt-0 md:mx-0 rounded-2xl p-4 shadow-xl w-auto md:w-72"
              style={{ background: "#fdf6ee", border: "1px solid #57422C" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold truncate max-w-[80%]" style={{ color: "#2b1807", fontFamily: "Georgia, serif" }}>{shareItem.name}</p>
                <button onClick={() => setShareItem(null)}><X className="w-4 h-4" style={{ color: "#835105" }} /></button>
              </div>
              <div className="flex items-center gap-2 mb-3 rounded-lg px-3 py-2" style={{ background: "#f0e6d6", border: "1px solid #57422C" }}>
                <p className="text-xs truncate flex-1" style={{ color: "#57422C" }}>{shareLink}</p>
                <button onClick={handleCopy} className="text-xs px-2 py-1 rounded-md shrink-0 font-medium" style={{ background: copied ? "#2b1807" : "#3d230c", color: "#e8d5b7" }}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <button onClick={handleWhatsApp} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium" style={{ background: "#25D366", color: "white" }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Share on WhatsApp
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function ButterflyCollectionsPage() {
  return (
    <Suspense>
      <CollectionsContent />
    </Suspense>
  );
}
