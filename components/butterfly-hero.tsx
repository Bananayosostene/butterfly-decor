"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const slidePairs = [
  {
    label: "Suits & Bridal",
    images: ["/groom.jpg", "/bridal.jpg"],
  },
  {
    label: "Decor & Bridal",
    images: ["/decor01.jpg", "/post-01.jpg"],
  },
  {
    label: "Cake & Gifts",
    images: ["/cakecollection.jpg", "/giftCollection.jpg"],
  },
  {
    label: "Decor & Bridal",
    images: ["/decor-post.png", "/bridal.jpg"],
  },
  {
    label: "Music & Decor",
    images: ["/music-setup.jpg", "/butterflyTeam.png"],
  },
  {
    label: "Umukeyero & Ikote",
    images: ["/post-03.jpg", "/post-02.jpg"],
  },
  {
    label: "Flowers & Photography",
    images: ["/flowerColection.jpg", "/photographerCollection.jpg"],
  },
];

export function WeddingShopHero() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slidePairs.length);
        setVisible(true);
      }, 600);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const pair = slidePairs[current];

  return (
    <section
      className="w-full min-h-[60vh] sm:min-h-[70vh] md:min-h-screen flex items-center overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #fdf6ee 0%, #f5e6d3 30%, #ede0d4 55%, #e8d5b7 80%, #fdf6ee 100%)",
      }}
    >
      {/* soft radial glow top-left */}
      <div
        className="absolute top-0 left-0 w-[60%] h-[60%] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top left, rgba(180,120,60,0.13) 0%, transparent 70%)",
        }}
      />
      {/* soft radial glow bottom-right */}
      <div
        className="absolute bottom-0 right-0 w-[50%] h-[50%] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at bottom right, rgba(139,90,43,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10 md:py-16">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 lg:gap-24">
          {/* LEFT */}
          <div className="flex flex-col items-start gap-5 w-full md:w-[45%] shrink-0">
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "#835105" }}
            >
              Kigali · Rwanda
            </p>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl leading-tight"
              style={{
                color: "#2b1807",
                fontFamily: "'Playball', cursive",
                fontWeight: 400,
              }}
            >
              Decor Studio
            </h1>
            <p
              className="text-base md:text-lg leading-relaxed max-w-sm"
              style={{ color: "#57422C" }}
            >
              We craft unforgettable moments — from elegant wedding decor and bridal dresses to cakes, gifts, and invitations. Every detail, beautifully designed for your special day.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="/collection"
                className="px-6 py-2.5 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
                style={{ background: "#2b1807", color: "#e8d5b7" }}
              >
                Explore Collection
              </a>
              <a
                href="https://web.whatsapp.com/send?phone=250788724867&text=Hello%20Butterfly%20Decor%20%F0%9F%8C%B8"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-full text-sm font-medium border transition-opacity hover:opacity-80"
                style={{ borderColor: "#57422C", color: "#2b1807" }}
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* RIGHT — butterfly wings */}
          <div className="flex-1 w-full flex flex-col items-center gap-5">
            {/* Label */}
            <p
              className="text-sm font-medium text-primary"
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}
            >
              {pair.label}
            </p>

            {/* Wings container — perspective for 3D */}
            <div
              className="flex items-center justify-center gap-1"
              style={{ perspective: "900px" }}
            >
              {/* LEFT WING — rotates from right edge (inner hinge) */}
              <div
                className="relative overflow-hidden shadow-lg"
                style={{
                  width: "clamp(130px, 19vw, 210px)",
                  height: "clamp(190px, 28vw, 310px)",
                  borderRadius: "6px",
                  transformOrigin: "right center",
                  transform: visible
                    ? "rotateY(0deg) rotateZ(-2deg)"
                    : "rotateY(-75deg) rotateZ(-15deg)",
                  opacity: visible ? 1 : 0,
                  transition:
                    "transform 0.7s cubic-bezier(0.34, 1.3, 0.64, 1) 0ms, opacity 0.5s ease 0ms",
                }}
              >
                <Image
                  src={pair.images[0]}
                  alt={pair.label}
                  fill
                  className="object-cover"
                  sizes="210px"
                />
              </div>

              {/* RIGHT WING — rotates from left edge (inner hinge) */}
              <div
                className="relative overflow-hidden shadow-lg"
                style={{
                  width: "clamp(130px, 19vw, 210px)",
                  height: "clamp(190px, 28vw, 310px)",
                  borderRadius: "6px",
                  transformOrigin: "left center",
                  transform: visible
                    ? "rotateY(0deg) rotateZ(2deg)"
                    : "rotateY(75deg) rotateZ(15deg)",
                  opacity: visible ? 1 : 0,
                  transition:
                    "transform 0.7s cubic-bezier(0.34, 1.3, 0.64, 1) 80ms, opacity 0.5s ease 80ms",
                }}
              >
                <Image
                  src={pair.images[1]}
                  alt={pair.label}
                  fill
                  className="object-cover"
                  sizes="210px"
                />
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex gap-2">
              {slidePairs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setVisible(false);
                    setTimeout(() => {
                      setCurrent(i);
                      setVisible(true);
                    }, 400);
                  }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? "20px" : "8px",
                    height: "8px",
                    background:
                      i === current
                        ? "var(--primary)"
                        : "color-mix(in oklch, var(--primary) 30%, transparent)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
