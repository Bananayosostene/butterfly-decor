"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { CheckCircle2, Share2, X } from "lucide-react";

type CollectionItem = {
  id: string;
  name: string;
  imageUrl: string;
  category: { id: string; name: string };
};

export function EntertainmentSection() {
  const topAutoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const bottomAutoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const [shareItem, setShareItem] = useState<{ id: string; label: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [topItems, setTopItems] = useState<CollectionItem[]>([]);
  const [bottomItems, setBottomItems] = useState<CollectionItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("butterfly-selected-items");
    if (saved) setSelectedItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    fetch("/api/collection-items")
      .then((r) => r.json())
      .then((res) => {
        const all: CollectionItem[] = res.data ?? [];
        const mid = Math.ceil(all.length / 2);
        setTopItems(all.slice(0, mid));
        setBottomItems(all.slice(mid));
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("butterfly-selected-items", JSON.stringify(selectedItems));
    window.dispatchEvent(new CustomEvent("selectedItemsChange", { detail: selectedItems.length }));
  }, [selectedItems]);

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const shareLink = shareItem
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/collection/${shareItem.id}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(shareLink)}`, "_blank", "noopener");
  };

  return (
    <section
      className="w-full overflow-hidden py-10"
      style={{ background: "#F5F5F7" }}
    >
      <div className="w-full 2xl:max-w-7xl 2xl:mx-auto">
       
        <h1
          className="text-3xl md:text-4xl mb-2 text-center"
          style={{ fontFamily: "'Playball', cursive", color: "var(--primary)" }}
        >
          Decor Collection
        </h1>

        {/* TOP ROW */}
        <div className="mb-3">
          <Carousel
            opts={{ align: "center", loop: true }}
            plugins={[topAutoplay.current]}
          >
            <CarouselContent className="-ml-3">
              {topItems.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="pl-3 basis-[85vw] md:basis-[50%]"
                >
                  <Link
                    href={`/collection/${item.id}`}
                    className="relative block overflow-hidden group"
                    style={{ height: "clamp(200px, 28vw, 300px)", backgroundColor: "#1a0a2e" }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      sizes="34vw"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelection(item.id); }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-smooth cursor-pointer shadow-md ${
                          selectedItems.includes(item.id) ? "bg-primary" : "bg-black/60"
                        }`}
                      >
                        <CheckCircle2 className={`h-3 w-3 ${selectedItems.includes(item.id) ? "text-primary-foreground" : "text-white"}`} />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShareItem({ id: item.id, label: item.name }); setCopied(false); }}
                        className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-md bg-black/60"
                      >
                        <Share2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div>
                        <p
                          className="text-xs font-semibold mb-0.5"
                          style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Georgia, serif" }}
                        >
                          {item.name}
                        </p>
                        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Georgia, serif" }}>
                          {item.category.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* BOTTOM ROW */}
        <Carousel
          opts={{ align: "center", loop: true }}
          plugins={[bottomAutoplay.current]}
        >
          <CarouselContent className="-ml-2">
            {bottomItems.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-2 basis-[42vw] md:basis-[26%]"
              >
                <Link
                  href={`/collection/${item.id}`}
                  className="relative block overflow-hidden group"
                  style={{ height: "clamp(120px, 16vw, 170px)", backgroundColor: "#1a0a2e" }}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    sizes="26vw"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelection(item.id); }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-smooth cursor-pointer shadow-md ${
                        selectedItems.includes(item.id) ? "bg-primary" : "bg-black/60"
                      }`}
                    >
                      <CheckCircle2 className={`h-3 w-3 ${selectedItems.includes(item.id) ? "text-primary-foreground" : "text-white"}`} />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShareItem({ id: item.id, label: item.name }); setCopied(false); }}
                      className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-md bg-black/60"
                    >
                      <Share2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                    <p
                      className="text-white text-sm font-semibold"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {item.name}
                    </p>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="text-center mt-6">
          <Link
            href="/collection"
            className="text-sm font-medium px-6 py-2 rounded-full inline-block bg-primary"
            style={{ color: "white" }}
          >
            more...
          </Link>
        </div>

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
                  {shareItem.label}
                </p>
                <button onClick={() => setShareItem(null)}>
                  <X className="w-4 h-4" style={{ color: "#835105" }} />
                </button>
              </div>
              <div
                className="flex items-center gap-2 mb-3 rounded-lg px-3 py-2"
                style={{ background: "#f0e6d6", border: "1px solid #57422C" }}
              >
                <p className="text-xs truncate flex-1" style={{ color: "#57422C" }}>
                  {shareLink}
                </p>
                <button
                  onClick={handleCopy}
                  className="text-xs px-2 py-1 rounded-md shrink-0 font-medium"
                  style={{ background: copied ? "#2b1807" : "#3d230c", color: "#e8d5b7" }}
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
      </div>
    </section>
  );
}
