"use client";

import { useEffect, useState } from "react";

const FALLBACK_VIDEO = "/hero-video.mp4";

export function WeddingShopHero() {
  const [heroHeight, setHeroHeight] = useState<string | undefined>(undefined);
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [videoSrc, setVideoSrc] = useState(FALLBACK_VIDEO);

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
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res?.data?.heroVideoUrl) setVideoSrc(res.data.heroVideoUrl);
      })
      .catch(() => {});
  }, []);

  // With the video visible, text sits on a dark warm scrim (brand chocolate).
  // Without it, we fall back to the plain cream gradient with dark text — never mix the two.
  const label = videoAvailable ? "#e8c078" : "#835105";
  const heading = videoAvailable ? "#fdf6ee" : "#2b1807";
  const paragraph = videoAvailable ? "#f0e6d6" : "#57422C";
  const highlight = videoAvailable ? "#e6c081" : "#835105";
  const secondaryBorder = videoAvailable ? "rgba(253,246,238,0.55)" : "#57422C";
  const secondaryText = videoAvailable ? "#fdf6ee" : "#2b1807";

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
      {/* background video — replace public/hero-video.mp4 with your own footage any time; falls back to the gradient below if the file is missing */}
      {videoAvailable && (
        <video
          key={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoAvailable(false)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
      {videoAvailable && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(100deg, rgba(43,24,7,0.78) 0%, rgba(43,24,7,0.45) 32%, rgba(43,24,7,0.16) 55%, rgba(43,24,7,0.4) 100%)",
            zIndex: 1,
          }}
        />
      )}
      {videoAvailable && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(43,24,7,0.55) 0%, transparent 45%)",
            zIndex: 1,
          }}
        />
      )}

      {/* soft radial glow top-left */}
      <div
        className="absolute top-0 left-0 w-[60%] h-[60%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(180,120,60,0.13) 0%, transparent 70%)",
          zIndex: 2,
        }}
      />
      {/* soft radial glow bottom-right */}
      <div
        className="absolute bottom-0 right-0 w-[50%] h-[50%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at bottom right, rgba(139,90,43,0.10) 0%, transparent 70%)",
          zIndex: 2,
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-14 md:py-0" style={{ zIndex: 3 }}>
        <div className="flex flex-col items-start gap-5 w-full max-w-xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: label }}
          >
            Kigali · Rwanda
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl leading-tight"
            style={{
              color: heading,
              fontFamily: "'Playball', cursive",
              fontWeight: 400,
              textShadow: videoAvailable ? "0 2px 18px rgba(0,0,0,0.35)" : "none",
            }}
          >
            Decor Studio
          </h1>
          <p
            className="text-base md:text-lg leading-relaxed max-w-sm"
            style={{
              color: paragraph,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 300,
              fontStyle: "italic",
              letterSpacing: "0.01em",
              textShadow: videoAvailable ? "0 1px 10px rgba(0,0,0,0.3)" : "none",
            }}
          >
            We create unforgettable moments through elegant décor and refined
            event styling, including bridal styling and outfits.{" "}
            <span
              style={{
                fontFamily: "'Playball', cursive",
                fontStyle: "normal",
                fontWeight: 400,
                color: highlight,
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
              href="https://wa.me/+250788724867?text=Hello%20Butterfly%20Decor%20%F0%9F%8C%B8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border transition-opacity hover:opacity-80"
              style={{ borderColor: secondaryBorder, color: secondaryText }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
              Let's chat
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
