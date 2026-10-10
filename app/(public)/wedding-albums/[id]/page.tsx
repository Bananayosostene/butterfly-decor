import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AlbumCard } from "@/components/album-card";
import { displaySerif } from "@/lib/fonts";
import { cldImage } from "@/lib/image";
import { albumDate, getWeddingAlbum, getWeddingAlbums } from "@/lib/wedding-albums";
import AlbumGallery from "./album-gallery";

type Props = { params: Promise<{ id: string }> };

const INK = "#2b1807";
const SOFT = "#57422C";
const LINE = "#e8d5b7";
/** Other albums suggested under the one being viewed. */
const OTHERS_SHOWN = 4;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const album = await getWeddingAlbum((await params).id);
  if (!album) return {};
  return {
    title: `${album.title} · Wedding Album`,
    description: `Photos from the wedding of ${album.title}, by Butterfly Decor.`,
    openGraph: { images: [cldImage(album.images[0], 1200)] },
  };
}

/** One couple's album: only their photos, then other albums to open. */
export default async function WeddingAlbumPage({ params }: Props) {
  const { id } = await params;
  const [album, all] = await Promise.all([getWeddingAlbum(id), getWeddingAlbums()]);
  if (!album) notFound();

  const others = all.filter((a) => a.id !== album.id).slice(0, OTHERS_SHOWN);
  const date = albumDate(album.weddingDate);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#fbf7f2" }}>
      <div className="max-w-6xl mx-auto px-4 pt-6 md:pt-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs md:text-sm" style={{ color: SOFT }}>
          <Link href="/wedding-albums" className="hover:underline underline-offset-4">Wedding albums</Link>
          <ChevronRight size={14} />
          <span className="truncate" style={{ color: INK }}>{album.title}</span>
        </nav>

        <header className="mt-5 text-center">
          <h1 className={`${displaySerif.className} text-xl md:text-2xl lg:text-3xl`} style={{ color: INK }}>{album.title}</h1>
          <p className="mt-1.5 text-sm" style={{ color: SOFT }}>
            {[date, `${album.images.length} photo${album.images.length !== 1 ? "s" : ""}`].filter(Boolean).join(" · ")}
          </p>
        </header>

        <div className="mt-6">
          <AlbumGallery title={album.title} images={album.images} />
        </div>

        {others.length > 0 && (
          <section className="mt-14 pt-10 border-t" style={{ borderColor: LINE }}>
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2 className={`${displaySerif.className} text-xl md:text-2xl lg:text-3xl`} style={{ color: INK }}>More wedding albums</h2>
              <Link href="/wedding-albums" className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] hover:underline underline-offset-4" style={{ color: INK }}>
                See all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {others.map((other) => (
                <AlbumCard key={other.id} album={other} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
