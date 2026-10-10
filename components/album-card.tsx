import Link from "next/link";
import { Images } from "lucide-react";
import { cldImage } from "@/lib/image";
import { displaySerif } from "@/lib/fonts";
import type { AlbumCard as Album } from "@/lib/wedding-albums";

const INK = "#2b1807";

/** One wedding album: its cover, the couple's names and how many photos it holds. */
export function AlbumCard({ album, eager, flush }: { album: Album; eager?: boolean; /** Edge-to-edge tile, as in the homepage row. */ flush?: boolean }) {
  return (
    <Link href={`/wedding-albums/${album.id}`} className="group block">
      <div className={`relative overflow-hidden aspect-[4/5] ${flush ? "" : "rounded-2xl"}`} style={{ background: "rgba(43,24,7,0.06)" }}>
        <img
          src={cldImage(album.cover, 800)}
          alt={`${album.title} wedding album`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ background: "rgba(0,0,0,0.55)" }}>
          <Images size={13} /> {album.count}
        </span>
      </div>
      <p
        className={`${displaySerif.className} ${flush ? "px-4 md:px-6 pt-4 md:pt-6" : "pt-3"} text-lg md:text-xl leading-snug transition-opacity group-hover:opacity-70`}
        style={{ color: INK }}
      >
        {album.title}
      </p>
    </Link>
  );
}
