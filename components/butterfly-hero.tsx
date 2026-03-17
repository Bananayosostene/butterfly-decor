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
    image: "/bridal.jpg",
    label: "For the Bride",
  },
  {
    image: "/groom.jpg",
    label: "For the Groom",
  },
  {
    image: "/bridal.jpg",
    label: "Accessories",
  },
];

export function WeddingShopHero({
  backgroundImage = "/hero-image.jpg",
  products = defaultProducts,
}: WeddingShopHeroProps) {
  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-between overflow-hidden"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24">
        <div className="flex items-center justify-between gap-8 lg:gap-16">
          {/* Left Section - Title and CTA */}
          <div className="flex flex-col items-start gap-8 flex-shrink-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-light text-white text-balance leading-tight">
              The Wedding Studio
            </h1>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-3 text-base"
            >
              REQUEST
            </Button>
          </div>

          {/* Right Section - Product Cards */}
          <div className="flex gap-6 md:gap-4 lg:gap-6 flex-wrap justify-end lg:flex-nowrap">
            {products.map((product, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-4 flex-shrink-0 rounded-lg"
              >
                {/* Product Image Container */}
                <div className="relative w-48 h-56 md:w-40 md:h-48 lg:w-48 lg:h-56 overflow-hidden rounded-sm border border-white/10">
                  <Image
                    src={product.image}
                    alt={product.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Product Label */}
                <p className="text-lg md:text-base lg:text-lg italic text-white text-center font-light">
                  {product.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
