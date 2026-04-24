"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryItem = {
  src: string;
  alt: string;
  tag: "wedding" | "floral" | "event" | "reception";
  title: string;
  size: "featured" | "wide" | "square" | "tall";
};

const inspirations: GalleryItem[] = [
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80", alt: "Wedding ceremony", tag: "wedding", title: "Garden Ceremony in Bloom", size: "featured" },
  { src: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=700&q=80", alt: "Floral arrangement", tag: "floral", title: "Cascading Rose Arch", size: "wide" },
  { src: "https://images.unsplash.com/photo-1478146059778-26b41624af1e?w=600&q=80", alt: "Table setting", tag: "reception", title: "Candlelit Table Scape", size: "square" },
  { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&q=80", alt: "Bridal party", tag: "wedding", title: "Bridesmaids in Ivory", size: "tall" },
  { src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=700&q=80", alt: "Event decor", tag: "event", title: "Corporate Gala Evening", size: "wide" },
  { src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80", alt: "Flower wall", tag: "floral", title: "Pampas & Wildflower Wall", size: "featured" },
  { src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80", alt: "Wedding cake", tag: "wedding", title: "Tiered Floral Cake Display", size: "square" },
  { src: "https://images.unsplash.com/photo-1553444836-bc6c8d340d56?w=700&q=80", alt: "Reception hall", tag: "reception", title: "Grand Hall Transformation", size: "wide" },
  { src: "https://images.unsplash.com/photo-1490750967868-88df5691cc8c?w=500&q=80", alt: "Bouquet", tag: "floral", title: "Bridal Bouquet Details", size: "tall" },
  { src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=700&q=80", alt: "Birthday event", tag: "event", title: "Luxury Birthday Soirée", size: "wide" },
  { src: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80", alt: "Candles", tag: "reception", title: "Warm Candlelight Ambience", size: "square" },
  { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80", alt: "Wedding aisle", tag: "wedding", title: "Petal-Lined Ceremony Aisle", size: "featured" },
];

const filters = [
  { label: "All", value: "all" },
  { label: "Wedding", value: "wedding" },
  { label: "Proposal", value: "proposal" },
  { label: "Bridal Show", value: "bridal-show" },
] as const;

type FilterValue = (typeof filters)[number]["value"];

const sizeToAspect = {
  featured: "aspect-[4/4]", 
  wide: "aspect-[4/3]", 
  square: "aspect-[1/1]",
  tall: "aspect-[4/4]",
};

export default function StyleInspirationsPage() {
  const [active, setActive] = useState<FilterValue>("all");

  const filtered =
    active === "all" ? inspirations : inspirations.filter((i) => i.tag === active);

  return (
    <main className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="text-center px-6 pt-8 pb-6">
        <h1 className="text-2xl md:text-4xl font-light text-primary mb-3">
          Outfit Ideas
        </h1>
        <p className="text-sm text-muted-foreground font-light max-w-md mx-auto leading-relaxed">
          Discover stylish outfit ideas and inspiration to help you dress with
          confidence for every special moment.
        </p>
      </section>

      {/* Filters */}
      <div className="flex justify-center gap-2 flex-wrap px-6 pb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className={`px-5 py-1.5 rounded-full border text-sm tracking-wide transition-all duration-300 ${
              active === f.value
                ? "bg-primary border-primary text-primary-foreground font-medium"
                : "border-primary/30 text-primary/60 hover:border-primary/60 hover:text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Masonry Gallery */}
      <div className="px-4 lg:px-10 max-w-7xl mx-auto pb-16">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={`${item.src}-${idx}`}
              className="break-inside-avoid mb-4 group relative overflow-hidden  cursor-pointer shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`relative ${sizeToAspect[item.size]} w-full overflow-hidden`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out "
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0  flex flex-col justify-end p-4">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/70 mb-1">
                    {item.tag}
                  </span>
                  <p className="text-white text-base font-light leading-snug mb-2">
                    {item.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No inspirations found for this category.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
