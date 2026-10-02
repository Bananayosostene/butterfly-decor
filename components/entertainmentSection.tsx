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
import { cldImage } from "@/lib/image";

type CollectionItem = { id: string; name: string; imageUrl: string };

export function EntertainmentSection({
  topItems,
  bottomItems,
}: {
  topItems: CollectionItem[];
  bottomItems: CollectionItem[];
}) {
  const topAutoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const bottomAutoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));

  return (
    <section className="w-full overflow-hidden py-10" style={{ background: "#F5F5F7" }}>
      <div className="w-full 2xl:max-w-7xl 2xl:mx-auto">
        <h1
          className="text-3xl md:text-4xl mb-2 text-center"
          style={{ fontFamily: "'Playball', cursive", color: "var(--primary)" }}
        >
          Decor Collection
        </h1>

        {/* TOP ROW */}
        <div className="mb-3">
          <Carousel opts={{ align: "center", loop: true }} plugins={[topAutoplay.current]}>
            <CarouselContent className="-ml-3">
              {topItems.map((item) => (
                <CarouselItem key={item.id} className="pl-3 basis-[85vw] md:basis-[50%]">
                  <Link
                    href={`/collection/${item.id}`}
                    className="relative block overflow-hidden group"
                    style={{ height: "clamp(200px, 28vw, 300px)", backgroundColor: "#1a0a2e" }}
                  >
                    <Image
                      src={cldImage(item.imageUrl, 900)}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      sizes="34vw"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 px-3 py-3"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}
                    >
                      <p className="text-white text-base sm:text-lg truncate" style={{ fontFamily: "Georgia, serif", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                        {item.name}
                      </p>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* BOTTOM ROW */}
        <Carousel opts={{ align: "center", loop: true }} plugins={[bottomAutoplay.current]}>
          <CarouselContent className="-ml-2">
            {bottomItems.map((item) => (
              <CarouselItem key={item.id} className="pl-2 basis-[42vw] md:basis-[26%]">
                <Link
                  href={`/collection/${item.id}`}
                  className="relative block overflow-hidden group"
                  style={{ height: "clamp(120px, 16vw, 170px)", backgroundColor: "#1a0a2e" }}
                >
                  <Image
                    src={cldImage(item.imageUrl, 500)}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    sizes="26vw"
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 px-2.5 py-2"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}
                  >
                    <p className="text-white text-base sm:text-lg truncate" style={{ fontFamily: "Georgia, serif", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                      {item.name}
                    </p>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="text-center mt-6">
          <Link
            href="/collection"
            className="text-sm font-medium px-6 py-2 rounded-full inline-block bg-primary"
            style={{ color: "white" }}
          >
            more...
          </Link>
        </div>
      </div>
    </section>
  );
}
