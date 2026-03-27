"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ProductCard {
  image: string;
  label: string;
}

interface WeddingShopHeroProps {
  backgroundImage?: string;
  products?: ProductCard[];
}

const defaultProducts: ProductCard[] = [
  {
    image: "/butterflyTeam.png",
    label: "For the Decor",
  },
  {
    image: "/groom.jpg",
    label: "For the Groom",
  },
  {
    image: "/bridal.jpg",
    label: "For the Bride",
  },
];

export function WeddingShopHero({
  backgroundImage = "/decor04.jpg",
  // backgroundImage = "/hero-image.jpg",
  products = defaultProducts,
}: WeddingShopHeroProps) {
  return (
    <section
      className="relative w-full min-h-[60vh] sm:min-h-[70vh] md:min-h-screen flex items-center justify-between overflow-hidden"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-primary/60" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center md:justify-between gap-8 lg:gap-16">
          {/* Left Section - Title and CTA */}
          <div className="flex flex-col items-start gap-8 shrink-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-light text-white text-balance leading-tight">
              The Wedding, Decor Studio
            </h1>
            <Button
              size="lg"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("openBookingModal"))
              }
              className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-3 text-base"
            >
              Book Now
            </Button>
          </div>

          {/* Right Section - Product Cards */}
          <div className="flex gap-4 md:gap-4 lg:gap-6 justify-center md:justify-end lg:flex-nowrap w-full md:w-auto">
            {products.map((product, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-4 flex-shrink-0 rounded-lg"
              >
                <a href="/collection">
                  <div className="relative w-[30vw] h-[38vw] md:w-40 md:h-48 lg:w-48 lg:h-56 overflow-hidden rounded-sm border border-white/10 cursor-pointer">
                    <Image
                      src={product.image}
                      alt={product.label}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </a>

                <a href="/collection">
                  <p className="text-sm md:text-base lg:text-lg italic text-white text-center font-light cursor-pointer">
                    {product.label}
                  </p>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
