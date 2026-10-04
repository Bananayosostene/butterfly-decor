"use client";

import { useState } from "react";
import { cldImage } from "@/lib/image";
import { displaySerif } from "@/lib/fonts";

type Photo = { id: string; imageUrl: string; description: string | null };

/** Photos shown before the "+N" tile is opened: one large and four small. */
const PREVIEW_COUNT = 5;

/** One large photo with four smaller ones; the last tile shows "+N" and opens the rest. */
export function VendorGallery({ photos, vendorName }: { photos: Photo[]; vendorName: string }) {
  const [showAll, setShowAll] = useState(false);

  const [first, ...rest] = photos;
  const side = rest.slice(0, PREVIEW_COUNT - 1);
  const more = rest.slice(PREVIEW_COUNT - 1);

  const tile = "relative aspect-square overflow-hidden";
  const tileStyle = { background: "rgba(43,24,7,0.06)" };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* The big photo takes its height from the two rows beside it; on phones it is a square. */}
        <div className="relative col-span-2 row-span-2 aspect-square md:aspect-auto overflow-hidden" style={tileStyle}>
          <img src={cldImage(first.imageUrl, 1100)} alt={first.description ?? vendorName} className="absolute inset-0 w-full h-full object-cover" />
        </div>
        {side.map((photo, i) => {
          const isMoreTile = !showAll && more.length > 0 && i === side.length - 1;
          const image = (
            <img src={cldImage(photo.imageUrl, 550)} alt={photo.description ?? vendorName} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          );
          return isMoreTile ? (
            <button
              key={photo.id}
              type="button"
              onClick={() => setShowAll(true)}
              aria-label={`Show ${more.length} more photos`}
              className={`${tile} cursor-pointer`}
              style={tileStyle}
            >
              {image}
              <span
                className={`${displaySerif.className} absolute inset-0 flex items-center justify-center text-3xl md:text-4xl text-white`}
                style={{ background: "rgba(43,24,7,0.55)" }}
              >
                +{more.length}
              </span>
            </button>
          ) : (
            <div key={photo.id} className={tile} style={tileStyle}>{image}</div>
          );
        })}
      </div>

      {showAll && (
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
          {more.map((photo) => (
            <div key={photo.id} className={tile} style={tileStyle}>
              <img src={cldImage(photo.imageUrl, 550)} alt={photo.description ?? vendorName} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
