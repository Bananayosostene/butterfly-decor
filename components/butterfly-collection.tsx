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
  { name: "Cake Collection", image: "/cakecollection.jpg" },
  { name: "Catering Collection", image: "/Catering.jpg" },
  { name: "Photography Collection", image: "/photographerCollection.jpg" },
  { name: "Florist Collection", image: "/flowerColection.jpg" },
  { name: "Gift Collection", image: "/giftCollection.jpg" },
  { name: "Sound System Setup", image: "/music-setup.jpg" },
];

export function DecorCollections({ collections = defaultCollections }: DecorCollectionsProps) {
  return (
    <section className="w-full py-6 md:py-8 bg-white px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto mb-4 md:mb-6 text-center">
        <h2 className="text-xl md:text-2xl lg:text-4xl font-light text-primary text-balance mb-4">
          Explore your dream of decor
        </h2>
        <p className="text-base md:text-lg text-primary text-balance">
          Discover our curated collection of wedding Collections to bring your dream wedding to life.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {collections.map((collection) => (
            <Link key={collection.name} href="/collection" className="group flex flex-col cursor-pointer">
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-lg group">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-primary/70 backdrop-blur-sm px-8 rounded-t-3xl shadow-lg">
                    <h3 className="font-playball text-center text-lg text-white whitespace-nowrap">
                      {collection.name}
                    </h3>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
