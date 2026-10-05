import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cldImage } from "@/lib/image";
import { itemHref } from "@/lib/category-icons";
import { displaySerif } from "@/lib/fonts";

type CollectionItem = { id: string; name: string; imageUrl: string };

const INK = "#2b1807";

/** Homepage showcase: the newest bridal and groom looks in one edge-to-edge row. */
export function RealWeddingSection({ items }: { items: CollectionItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="w-full pt-10 md:pt-14 pb-12" style={{ background: "#fbf7f2" }}>
      <div className=" px-4 md:px-12 lg:px-20 mb-6 md:mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className={`${displaySerif.className} text-2xl md:text-3xl leading-tight`} style={{ color: INK }}>
          Browse Latest Real Wedding Albums
        </h2>
        <Link
          href="/collection"
          className="group flex items-center gap-3 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] pb-1"
          style={{ color: INK }}
        >
          Browse all looks
          <ArrowRight size={18} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Edge to edge, no gaps: 2 per row on phones, 4 on desktop. */}
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Link key={item.id} href={itemHref(item.id)} className="group block">
            <div className="relative overflow-hidden aspect-[4/5]" style={{ background: "rgba(43,24,7,0.06)" }}>
              <img
                src={cldImage(item.imageUrl, 800)}
                alt={item.name}
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p
              className={`${displaySerif.className} px-4 md:px-6 pt-4 md:pt-6 text-lg md:text-xl leading-snug transition-opacity group-hover:opacity-70`}
              style={{ color: INK }}
            >
              {item.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
