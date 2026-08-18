"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { stripHtmlToText } from "@/lib/text";

type CategoryImage = { id: string; imageUrl: string; order: number };
type Category = { id: string; name: string; description?: string; imageUrl?: string; images?: CategoryImage[] };

const CHOCOLATE = "#2b1807";
const BORDER = "#e8d5b7";
const GOLD = "#835105";

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function ServiceSections() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const pausedRef = useRef(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => setCategories(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (categories.length < 2) return;
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      setVisible(false);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % categories.length);
        setVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(interval);
  }, [categories.length]);

  const goTo = (i: number) => {
    setActive((prev) => {
      if (prev === i) return prev;
      setVisible(false);
      setTimeout(() => setVisible(true), 300);
      return i;
    });
  };

  if (loading) {
    return (
      <section className="w-full py-10 md:py-14 px-4 md:px-8 lg:px-12" style={{ background: "#F5F5F7" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-14">
          <div className="flex-1 flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-xl h-16" style={{ background: "var(--muted)" }} />
            ))}
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse rounded-2xl w-full max-w-sm" style={{ height: 280, background: "var(--muted)" }} />
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  const activeCategory = categories[active];
  const gallery = (activeCategory.images ?? []).map((img) => img.imageUrl);
  const candidateImages = [activeCategory.imageUrl, ...gallery].filter(Boolean) as string[];
  const leftImage = candidateImages[0];
  const rightImage = candidateImages[1] ?? candidateImages[0];

  return (
    <section className="w-full py-10 md:py-14 px-4 md:px-8 lg:px-12" style={{ background: "#F5F5F7" }}>
      <div className="max-w-6xl mx-auto mb-8 md:mb-12 text-center">
        <h2 className="text-xl md:text-3xl font-light mb-2 font-playball" style={{ color: CHOCOLATE }}>
          Our Signature Services
        </h2>
        <p className="text-sm md:text-base" style={{ color: "rgba(43,24,7,0.65)" }}>
          Hover a service to preview it, tap to explore the full collection.
        </p>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center md:items-stretch gap-10 md:gap-14">
        {/* LEFT — service list, text only */}
        <div
          className="flex-1 w-full flex flex-col"
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {categories.map((cat, i) => {
            const isActive = i === active;
            return (
              <Link
                key={cat.id}
                href={`/collection?cat=${slugify(cat.name)}`}
                onMouseEnter={() => goTo(i)}
                className="group relative flex items-center gap-4 pl-4 border-b transition-all duration-300 overflow-hidden"
                style={{ borderColor: BORDER, paddingTop: isActive ? "1.1rem" : "0.6rem", paddingBottom: isActive ? "1.1rem" : "0.6rem" }}
              >
                <span
                  className="absolute left-0 top-2 bottom-2 rounded-full transition-all duration-300"
                  style={{ width: isActive ? 3 : 0, background: GOLD }}
                />
                <span
                  className="shrink-0 font-playball transition-colors duration-300"
                  style={{ fontSize: "1.1rem", color: isActive ? GOLD : "rgba(43,24,7,0.35)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-1 min-w-0">
                  <span
                    className="font-playball leading-tight transition-all duration-300"
                    style={{ color: CHOCOLATE, fontSize: isActive ? "1.5rem" : "1rem", opacity: isActive ? 1 : 0.6 }}
                  >
                    {cat.name}
                  </span>
                  <div
                    className="grid transition-all duration-300"
                    style={{ gridTemplateRows: isActive ? "1fr" : "0fr", opacity: isActive ? 1 : 0 }}
                  >
                    <div className="overflow-hidden min-h-0">
                      {cat.description && (
                        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "rgba(43,24,7,0.6)" }}>
                          {stripHtmlToText(cat.description)}
                        </p>
                      )}
                      <span className="text-xs font-medium mt-0.5 inline-block" style={{ color: GOLD }}>
                        Explore this collection →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* RIGHT — butterfly wings revealing the active service */}
        <div className="flex-1 w-full flex flex-col items-center gap-5">
          <div className="flex items-center justify-center gap-1" style={{ perspective: "900px" }}>
            {/* LEFT WING */}
            <div
              className="relative overflow-hidden shadow-lg"
              style={{
                width: "clamp(130px, 19vw, 210px)",
                height: "clamp(190px, 28vw, 310px)",
                borderRadius: "6px",
                background: CHOCOLATE,
                transformOrigin: "right center",
                transform: visible ? "rotateY(0deg) rotateZ(-2deg)" : "rotateY(-75deg) rotateZ(-15deg)",
                opacity: visible ? 1 : 0,
                transition: "transform 0.7s cubic-bezier(0.34, 1.3, 0.64, 1) 0ms, opacity 0.5s ease 0ms",
              }}
            >
              {leftImage && (
                <Image
                  src={leftImage}
                  alt={activeCategory.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="210px"
                />
              )}
            </div>

            {/* RIGHT WING — a second, different photo of the same active service when one is available */}
            <div
              className="relative overflow-hidden shadow-lg"
              style={{
                width: "clamp(130px, 19vw, 210px)",
                height: "clamp(190px, 28vw, 310px)",
                borderRadius: "6px",
                background: CHOCOLATE,
                transformOrigin: "left center",
                transform: visible ? "rotateY(0deg) rotateZ(2deg)" : "rotateY(75deg) rotateZ(15deg)",
                opacity: visible ? 1 : 0,
                transition: "transform 0.7s cubic-bezier(0.34, 1.3, 0.64, 1) 80ms, opacity 0.5s ease 80ms",
              }}
            >
              {rightImage && (
                <Image
                  src={rightImage}
                  alt={activeCategory.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="210px"
                />
              )}
            </div>
          </div>

          <p className="font-playball text-lg" style={{ color: CHOCOLATE }}>
            {activeCategory.name}
          </p>

          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap justify-center max-w-xs">
              {categories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === active ? "20px" : "8px",
                    height: "8px",
                    background: i === active ? GOLD : "rgba(131,81,5,0.25)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
