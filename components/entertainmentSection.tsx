"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const topItems = [
  { label: "Decor", sublabel: "Transform every corner", cta: "Explore now", image: "/bridalCollection.jpg", href: "/collection?collection=Decor", bg: "#1a0a2e" },
  { label: "Car Decor", sublabel: "Ride in style", cta: "Shop now", image: "/venueCollection.jpg", href: "/collection?collection=Car Decor", bg: "#3B1A08" },
  { label: "Cake", sublabel: "Sweet celebrations", cta: "Order now", image: "/cakeCollection.jpg", href: "/collection?collection=Cake", bg: "#1a0a2e" },
  { label: "Gifts", sublabel: "Give with love", cta: "Browse gifts", image: "/cateringCollection.jpg", href: "/collection?collection=Gifts", bg: "#0d2012" },
  { label: "Invitation", sublabel: "Make it memorable", cta: "Design yours", image: "/photographerCollection.jpg", href: "/collection?collection=Invitation", bg: "#0d2012" },
  { label: "Dresses", sublabel: "Elegance redefined", cta: "View collection", image: "/bridal.jpg", href: "/collection?collection=Dresses", bg: "#3B1A08" },
];

const bottomItems = [
  { label: "Decor", cta: "Explore", image: "/bridalCollection.jpg", href: "/collection?collection=Decor", bg: "#2d1a00" },
  { label: "Car Decor", cta: "Shop", image: "/venueCollection.jpg", href: "/collection?collection=Car Decor", bg: "#1a0a2e" },
  { label: "Cake", cta: "Order", image: "/cakeCollection.jpg", href: "/collection?collection=Cake", bg: "#3B1A08" },
  { label: "Gifts", cta: "Browse", image: "/cateringCollection.jpg", href: "/collection?collection=Gifts", bg: "#0d2012" },
  { label: "Invitation", cta: "Design", image: "/photographerCollection.jpg", href: "/collection?collection=Invitation", bg: "#1a0a2e" },
  { label: "Dresses", cta: "View", image: "/bridal.jpg", href: "/collection?collection=Dresses", bg: "#3B1A08" },
  { label: "Decor", cta: "Explore", image: "/bridalCollection.jpg", href: "/collection?collection=Decor", bg: "#2d1a00" },
  { label: "Gifts", cta: "Browse", image: "/cateringCollection.jpg", href: "/collection?collection=Gifts", bg: "#0d2012" },
];

export function EntertainmentSection() {
  const topAutoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));
  const bottomAutoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));

  return (
    <section className="w-full overflow-hidden py-10" style={{ background: "#F5F5F7" }}>
      <h2
        className="text-center text-3xl md:text-4xl font-bold mb-6 tracking-tight font-playball"
        style={{ color: "#1a1a1a" }}
      >
        Endless inspiration.
      </h2>

      {/* TOP ROW — 1 full center + halves on sides = basis ~34% */}
      <div className="mb-3">
        <Carousel
          opts={{ align: "center", loop: true }}
          plugins={[topAutoplay.current]}
        >
          <CarouselContent className="-ml-3">
            {topItems.map((item, i) => (
              <CarouselItem key={i} className="pl-3 basis-[85vw] md:basis-[50%]">
                <Link
                  href={item.href}
                  className="relative block overflow-hidden group"
                  style={{ height: "clamp(200px, 28vw, 300px)", backgroundColor: item.bg }}
                >
                  <Image
                    src={item.image}
                    alt={item.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    sizes="34vw"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Georgia, serif" }}>
                        {item.label}
                      </p>
                      <p className="text-white text-sm" style={{ fontFamily: "Georgia, serif" }}>
                        {item.sublabel}
                      </p>
                    </div>
                    <span
                      className="text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap"
                      style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}
                    >
                      {item.cta}
                    </span>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* BOTTOM ROW — 3 full center + halves on sides = basis ~26% */}
      <Carousel
        opts={{ align: "center", loop: true }}
        plugins={[bottomAutoplay.current]}
      >
        <CarouselContent className="-ml-2">
          {bottomItems.map((item, i) => (
            <CarouselItem key={i} className="pl-2 basis-[42vw] md:basis-[26%]">
              <Link
                href={item.href}
                className="relative block  overflow-hidden group"
                style={{ height: "clamp(120px, 16vw, 170px)", backgroundColor: item.bg }}
              >
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  sizes="26vw"
                />
                <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                  <p className="text-white text-sm font-semibold" style={{ fontFamily: "Georgia, serif" }}>
                    {item.label}
                  </p>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}
                  >
                    {item.cta}
                  </span>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
