"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Share2, X } from "lucide-react";

type CollectionItem = {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  categoryId: string;
  category: { id: string; name: string };
};

const svgCategories = [
  { id: "all", name: "All", label: "All", icon: "all.svg" },
  { id: "decor", name: "Decor", label: "Decor", icon: "decor.svg" },
  { id: "suits", name: "Groom Suits", label: "Suits", icon: "suits.svg" },
  { id: "bridal", name: "Bridal", label: "Bridal", icon: "bridal.svg" },
  { id: "gift-box", name: "Gift Box", label: "Gift Box", icon: "gift-box.svg" },
  {
    id: "invitation",
    name: "Invitation",
    label: "Invitation",
    icon: "invitation.svg",
  },
  { id: "cake", name: "Other", label: "Other", icon: "cake.svg" },
];

// Split items into N columns as evenly as possible
function splitIntoColumns<T>(items: T[], n: number): T[][] {
  const cols: T[][] = Array.from({ length: n }, () => []);
  items.forEach((item, i) => cols[i % n].push(item));
  return cols;
}

export default function ButterflyCollectionsPage() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [displayedItems, setDisplayedItems] = useState<CollectionItem[]>([]);
  const [allItems, setAllItems] = useState<CollectionItem[]>([]);
  const [dbCategories, setDbCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [shareItem, setShareItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const shareLink = shareItem
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/collection/item/${shareItem.id}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareLink)}`,
      "_blank",
    );
  };

  useEffect(() => {
    fetch("/api/collection-items")
      .then((r) => r.json())
      .then((res) => {
        const items: CollectionItem[] = res.data ?? [];
        setAllItems(items);
        const seen = new Set<string>();
        const cats: { id: string; name: string }[] = [];
        items.forEach((item) => {
          if (!seen.has(item.category.id)) {
            seen.add(item.category.id);
            cats.push({ id: item.category.id, name: item.category.name });
          }
        });
        setDbCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("butterfly-selected-items");
    if (saved) setSelectedItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "butterfly-selected-items",
      JSON.stringify(selectedItems),
    );
    window.dispatchEvent(
      new CustomEvent("selectedItemsChange", { detail: selectedItems.length }),
    );
  }, [selectedItems]);

  useEffect(() => {
    let filtered = allItems;
    if (activeFilter !== "all") {
      const svgCat = svgCategories.find((s) => s.id === activeFilter);
      if (svgCat) {
        filtered = filtered.filter(
          (item) =>
            item.category.name
              .toLowerCase()
              .includes(svgCat.name.toLowerCase()) ||
            svgCat.name
              .toLowerCase()
              .includes(item.category.name.toLowerCase()),
        );
      }
    }
    setDisplayedItems([...filtered].sort(() => Math.random() - 0.5));
  }, [activeFilter, allItems]);

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const visibleCategories = svgCategories.filter((s) => {
    if (s.id === "all") return true;
    return dbCategories.some(
      (db) =>
        db.name.toLowerCase().includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(db.name.toLowerCase()),
    );
  });

  // Responsive column count
  const [colCount, setColCount] = useState(4);
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

  const columns = splitIntoColumns(displayedItems, colCount);

  const GalleryCard = ({ item }: { item: CollectionItem }) => (
    <div
      className="relative overflow-hidden group cursor-pointer w-full mb-2"
      onClick={() => router.push(`/collection/${item.id}`)}
    >
      {/* img with natural height — no fixed height, no object-cover crop */}
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-full h-auto block"
        loading="lazy"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSelection(item.id);
          }}
          className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all ${
            selectedItems.includes(item.id) ? "bg-primary" : "bg-black/60"
          }`}
        >
          <CheckCircle2
            className={`h-4 w-4 ${selectedItems.includes(item.id) ? "text-primary-foreground" : "text-white"}`}
          />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShareItem({ id: item.id, name: item.name });
            setCopied(false);
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-md bg-black/60"
        >
          <Share2 className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Label on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
        }}
      >
        <p
          className="text-white text-xs font-medium truncate"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {item.name}
        </p>
        <p
          className="text-white/70 text-[10px] truncate"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {item.category.name}
        </p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-background flex flex-col items-center">
      {/* Header */}
      <section className="pt-8 pb-0 md:pb-4 px-4 w-full">
        <div className="text-left sm:text-center">
          <h1
            className="text-3xl md:text-4xl mb-2"
            style={{
              fontFamily: "'Playball', cursive",
              color: "var(--primary)",
            }}
          >
            Butterfly Collections
          </h1>
        </div>
      </section>

      {/* Category filters */}
      <section className="pb-2 px-4 w-full">
        <div className="max-w-6xl mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 w-max px-2 lg:w-full lg:justify-center">
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`flex flex-col items-center gap-2 shrink-0 transition-all ${
                  activeFilter === category.id
                    ? "opacity-100"
                    : "opacity-60 hover:opacity-80"
                }`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
                  <img
                    src={`/${category.icon}`}
                    alt={category.label}
                    className="w-full h-full object-contain border-2 border-primary/50 rounded-full"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground text-center whitespace-nowrap">
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="py-4 sm:py-5 md:py-6 lg:py-8 px-1 pb-16 w-full">
        {loading ? (
          <div className="flex justify-center py-16">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--primary)" }}
            />
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No items found.</p>
          </div>
        ) : (
          /* CSS Masonry — columns keep fixed width, height stretches per image */
          <div
            className="w-full"
            style={{
              columnCount: colCount,
              columnGap: "6px",
            }}
          >
            {displayedItems.map((item) => (
              <div
                key={item.id}
                style={{ breakInside: "avoid", marginBottom: "6px" }}
              >
                <GalleryCard item={item} />
              </div>
            ))}
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
      </section>
    </main>
  );
}
