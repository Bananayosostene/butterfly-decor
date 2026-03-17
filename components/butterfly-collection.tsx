"use client";

import Image from "next/image";
import Link from "next/link";

interface Collection {
  id: string;
  name: string;
  images: string[];
}

interface DecorCollectionsProps {
  collections?: Collection[];
}

const defaultCollections: Collection[] = [
  {
    id: "bridal",
    name: "Bridal Collection",
    images: [
      "/bridal.jpg",
      "/bridal.jpg",
      "/bridal.jpg",
      "/bridal.jpg",
    ],
  },
  {
    id: "venue",
    name: "Venue Collection",
    images: [
      "/venueCollection.jpg",
      "/venue-2.jpg",
      "/venue-3.jpg",
      "/venue-4.jpg",
    ],
  },
  {
    id: "cake",
    name: "Videography Collection",
    images: [
      "/cakeCollection.jpg",
      "/video-2.jpg",
      "/video-3.jpg",
      "/video-4.jpg",
    ],
  },
  {
    id: "catering",
    name: "Catering Collection",
    images: [
      "/cateringCollection.jpg",
      "/catering-2.jpg",
      "/catering-3.jpg",
      "/catering-4.jpg",
    ],
  },
  {
    id: "photography",
    name: "Photography Collection",
    images: [
      "/photographerCollection.jpg",
      "/photo-2.jpg",
      "/photo-3.jpg",
      "/photo-4.jpg",
    ],
  },
  {
    id: "cake",
    name: "Videography Collection",
    images: [
      "/cakeCollection.jpg",
      "/video-2.jpg",
      "/video-3.jpg",
      "/video-4.jpg",
    ],
  },
  {
    id: "catering",
    name: "Catering Collection",
    images: [
      "/cateringCollection.jpg",
      "/catering-2.jpg",
      "/catering-3.jpg",
      "/catering-4.jpg",
    ],
  },
  {
    id: "florist",
    name: "Florist Collection",
    images: [
      "/flowerColection.jpg",
      "/florist-2.jpg",
      "/florist-3.jpg",
      "/florist-4.jpg",
    ],
  },
];

export function DecorCollections({
  collections = defaultCollections,
}: DecorCollectionsProps) {
  return (
    <section className="w-full py-6 md:py-8 bg-white px-6 md:px-12 lg:px-20">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-4 md:mb-6 text-center">
        <h2 className="text-xl md:text-2xl lg:text-4xl font-light text-primary text-balance mb-4">
          Explore your dream of decor
        </h2>
        <p className="text-base md:text-lg text-primary text-balance">
          Discover our curated collection of wedding Collections to bring your
          dream wedding to life.
        </p>
      </div>

      {/* Collections Grid - One Image Per Collection */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collection/${collection.id}`}
              className="group flex flex-col cursor-pointer"
            >
              {/* Collection Image */}
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-lg group">
                <Image
                  src={collection.images[0]}
                  alt={collection.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent rounded-3xl" />
                {/* Bottom Badge */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-primary/20 backdrop-blur-sm px-8  rounded-t-3xl shadow-lg">
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
