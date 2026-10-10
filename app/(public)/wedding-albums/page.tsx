import type { Metadata } from "next";
import { AlbumCard } from "@/components/album-card";
import { displaySerif } from "@/lib/fonts";
import { getWeddingAlbums } from "@/lib/wedding-albums";

export const metadata: Metadata = {
  title: "Real Wedding Albums",
  description: "Photos from real weddings decorated and dressed by Butterfly Decor in Rwanda.",
};

const INK = "#2b1807";
const SOFT = "#57422C";

/** Every wedding album, newest first. */
export default async function WeddingAlbumsPage() {
  const albums = await getWeddingAlbums();

  return (
    <div className="min-h-screen pb-24" style={{ background: "#fbf7f2" }}>
      <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-10">
        <header className="text-center">
          <h1 className={`${displaySerif.className} text-xl md:text-2xl lg:text-3xl`} style={{ color: INK }}>
            Real Wedding Albums
          </h1>
          <p className="mt-2 text-sm" style={{ color: SOFT }}>Choose a couple to see their wedding.</p>
        </header>

        {albums.length === 0 ? (
          <p className="mt-16 text-center text-sm" style={{ color: SOFT }}>Albums are coming soon.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {albums.map((album, i) => (
              <AlbumCard key={album.id} album={album} eager={i < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
