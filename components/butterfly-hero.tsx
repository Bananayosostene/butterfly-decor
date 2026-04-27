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
  const [heroHeight, setHeroHeight] = useState<string | undefined>(undefined);

  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth >= 768) {
        setHeroHeight(`calc(100vh - 64px)`);
      } else {
        setHeroHeight(undefined);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slidePairs.length);
        setVisible(true);
      }, 600);
    }, 3500);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const pair = slidePairs[current];

  return (
    <section
      className="w-full flex items-center overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, #fdf6ee 0%, #f5e6d3 30%, #ede0d4 55%, #e8d5b7 80%, #fdf6ee 100%)",
        minHeight: heroHeight ?? "60vh",
        height: heroHeight,
      }}
    >
      {/* soft radial glow top-left */}
      <div
        className="absolute top-0 left-0 w-[60%] h-[60%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(180,120,60,0.13) 0%, transparent 70%)",
        }}
      />
      {/* soft radial glow bottom-right */}
      <div
        className="absolute bottom-0 right-0 w-[50%] h-[50%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at bottom right, rgba(139,90,43,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10 md:py-0">
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
              style={{
                color: "#57422C",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 300,
                fontStyle: "italic",
                letterSpacing: "0.01em",
              }}
            >
              We create unforgettable moments through elegant décor and refined
              event styling, including bridal styling and outfits.{" "}
              <span
                style={{
                  fontFamily: "'Playball', cursive",
                  fontStyle: "normal",
                  fontWeight: 400,
                  color: "#835105",
                  fontSize: "1.05em",
                }}
              >
                Every detail is carefully designed to bring beauty, emotion, and style to your special day.
              </span>
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border transition-opacity hover:opacity-80"
                style={{ borderColor: "#57422C", color: "#2b1807" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                Let's chat
              </a>
            </div>
          </div>

          {/* RIGHT — butterfly wings */}
          <div className="flex-1 w-full flex flex-col items-center gap-5">
           

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
