"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { displaySerif } from "@/lib/fonts";
import { cldImage } from "@/lib/image";

/** Photos shown before the visitor opens the whole album with the "+N" tile (as in the collection). */
const PREVIEW_COUNT = 5;

/**
 * The photos of one album, laid out like the collection gallery: blocks of five, one large photo
 * with four smaller ones beside it (under it on phones). A click opens a photo full screen with
 * previous / next through the whole album.
 */
export default function AlbumGallery({ title, images }: { title: string; images: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const shown = showAll ? images : images.slice(0, PREVIEW_COUNT);
  const hiddenCount = images.length - shown.length;
  const blocks: string[][] = [];
  for (let i = 0; i < shown.length; i += PREVIEW_COUNT) blocks.push(shown.slice(i, i + PREVIEW_COUNT));

  const step = (by: number) => setOpen((i) => (i === null ? i : (i + by + images.length) % images.length));

  // Keyboard: arrows move, Escape closes. The page behind does not scroll while a photo is open.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open === null]);

  return (
    <>
      <div className="space-y-2">
        {blocks.map((block, b) => (
          <div key={block[0]} className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {block.map((url, i) => {
              const index = b * PREVIEW_COUNT + i;
              const big = i === 0;
              // The last tile of the preview shows "+N" and opens the rest of the album.
              const isMoreTile = hiddenCount > 0 && index === shown.length - 1;
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => (isMoreTile ? setShowAll(true) : setOpen(index))}
                  aria-label={isMoreTile ? `Show ${hiddenCount} more photos` : `Open photo ${index + 1} of ${images.length}`}
                  // The big tile takes its height from the two rows of small tiles next to it; on
                  // phones nothing sits beside it, so it keeps a square shape of its own.
                  className={`group relative block overflow-hidden rounded-md cursor-pointer ${big ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square"}`}
                  style={{ background: "rgba(43,24,7,0.06)" }}
                >
                  <img
                    src={cldImage(url, big ? 1100 : 550)}
                    alt={`${title}, photo ${index + 1}`}
                    loading={b === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  {isMoreTile ? (
                    <span className={`${displaySerif.className} absolute inset-0 flex items-center justify-center text-4xl md:text-5xl text-white`} style={{ background: "rgba(43,24,7,0.55)" }}>
                      +{hiddenCount}
                    </span>
                  ) : (
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title}, photo ${open + 1} of ${images.length}`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
          onClick={() => setOpen(null)}
        >
          <img
            src={cldImage(images[open], 1600)}
            alt={`${title}, photo ${open + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute top-4 left-4 text-sm text-white/80">{open + 1} / {images.length}</p>
          <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center bg-white/15 text-white cursor-pointer">
            <X size={20} />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                aria-label="Previous photo"
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-white/15 text-white cursor-pointer"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); step(1); }}
                aria-label="Next photo"
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-white/15 text-white cursor-pointer"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
