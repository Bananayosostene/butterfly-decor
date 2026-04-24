"use client";

import Image from "next/image";
import Link from "next/link";

interface Collection {
  name: string;
  image: string;
}

interface DecorCollectionsProps {
  collections?: Collection[];
}

const defaultCollections: Collection[] = [
  { name: "Bridal Collection", image: "/bridal.jpg" },
  { name: "Venue Collection", image: "/venueCollection.jpg" },
  { name: "Cake Collection", image: "/cakeCollection.jpg" },
  { name: "Catering Collection", image: "/cateringCollection.jpg" },
  { name: "Photography Collection", image: "/photographerCollection.jpg" },
  { name: "Florist Collection", image: "/flowerColection.jpg" },
  { name: "Gift Collection", image: "/bridalCollection.jpg" },
  { name: "Sound System", image: "/venueCollection.jpg" },
  { name: "Car Decor", image: "/cakeCollection.jpg" },
  { name: "Invitation", image: "/cateringCollection.jpg" },
];

const cardStyle = (bg = "#1a0a2e") => ({ backgroundColor: bg });

const bgs = ["#1a0a2e", "#3B1A08", "#0d2012", "#2d1a00", "#1a0a2e", "#3B1A08", "#0d2012", "#2d1a00", "#1a0a2e", "#3B1A08"];

function CollectionCard({ item, height, index }: { item: Collection; height: string; index: number }) {
  return (
    <Link
      href={`/collection?collection=${encodeURIComponent(item.name)}`}
      className="relative block overflow-hidden rounded-2xl group flex-shrink-0 w-full"
      style={{ height, ...cardStyle(bgs[index % bgs.length]) }}
    >
      <Image
        src={item.image}
        alt={item.name}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        sizes="33vw"
      />
      {/* gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(15,11,6,0.75) 0%, transparent 55%)" }}
      />
      {/* name */}
      <p
        className="absolute bottom-10 left-3 text-white text-sm font-semibold"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {item.name}
      </p>
      {/* book button */}
      <span
        className="absolute bottom-3 left-3 text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap"
        style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}
      >
        Book
      </span>
    </Link>
  );
}

export function DecorCollections({ collections = defaultCollections }: DecorCollectionsProps) {
  // Split into groups of 10, each group renders 3 rows: 3 + 4 + 3
  const groups: Collection[][] = [];
  for (let i = 0; i < collections.length; i += 10) {
    groups.push(collections.slice(i, i + 10));
  }

  return (
    <section className="w-full py-6 md:py-10 px-4 md:px-8 lg:px-12" style={{ background: "#F5F5F7" }}>
      <div className="max-w-6xl mx-auto mb-6 text-center">
        <h2 className="text-xl md:text-3xl font-light text-foreground mb-2 font-playball">
          Explore your dream of decor
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Discover our curated collections to bring your dream event to life.
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-2">
        {groups.map((group, gi) => {
          const row1 = group.slice(0, 3);   // 3 items: sides short, middle tall
          const row2 = group.slice(3, 7);   // 4 items: same width > height
          const row3 = group.slice(7, 10);  // 3 items: same size, bigger than row2

          const baseIndex = gi * 10;

          return (
            <div key={gi} className="space-y-2">

              {/* ROW 1 — 3 images: middle taller, sides shorter */}
              {row1.length > 0 && (
                <div className="flex gap-2 items-end">
                  {row1.map((item, i) => {
                    const isMid = i === 1;
                    return (
                      <div key={i} className={isMid ? "flex-[1.6]" : "flex-[1]"}>
                        <CollectionCard
                          item={item}
                          height={isMid ? "clamp(240px, 28vw, 340px)" : "clamp(160px, 18vw, 220px)"}
                          index={baseIndex + i}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ROW 2 — 4 images: same size, wider than tall */}
              {row2.length > 0 && (
                <div className="flex gap-2">
                  {row2.map((item, i) => (
                    <div key={i} className="flex-1">
                      <CollectionCard
                        item={item}
                        height="clamp(100px, 13vw, 160px)"
                        index={baseIndex + 3 + i}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ROW 3 — 3 images: same size, slightly taller than row2 */}
              {row3.length > 0 && (
                <div className="flex gap-2">
                  {row3.map((item, i) => (
                    <div key={i} className="flex-1">
                      <CollectionCard
                        item={item}
                        height="clamp(130px, 16vw, 200px)"
                        index={baseIndex + 7 + i}
                      />
                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </section>
  );
}
