"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Category = { id: string; name: string; description?: string; imageUrl?: string };

const CHOCOLATE = "#2b1807";
const CARD_BG = "#fdf6ee";
const BORDER = "#e8d5b7";

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function Panel({ category, flex }: { category: Category; flex: number }) {
  return (
    <Link
      href={`/collection?cat=${slugify(category.name)}`}
      className="group cursor-pointer flex items-center gap-3 md:gap-6 px-4 md:px-8 py-4 md:py-5 rounded-2xl transition-shadow duration-300 hover:shadow-xl w-full"
      style={{
        flex,
        background: CARD_BG,
        border: `1.5px solid ${BORDER}`,
        minHeight: "90px",
      }}
    >
      {/* Circle image */}
      <div
        className="shrink-0 rounded-full overflow-hidden transition-transform duration-500 group-hover:scale-105 relative"
        style={{
          width: "clamp(60px, 12vw, 160px)",
          height: "clamp(60px, 12vw, 160px)",
          background: CHOCOLATE,
          border: `2px solid ${BORDER}`,
        }}
      >
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 60px, 160px"
          />
        ) : (
          <div className="w-full h-full" style={{ background: CHOCOLATE }} />
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span
          className="font-playball leading-tight"
          style={{
            color: CHOCOLATE,
            fontSize: "clamp(0.85rem, 2.5vw, 1.5rem)",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {category.name}
        </span>
        {category.description && (
          <p
            className="leading-relaxed line-clamp-2"
            style={{
              color: "rgba(43,24,7,0.65)",
              fontSize: "clamp(0.65rem, 1.8vw, 0.875rem)",
            }}
          >
            {category.description}
          </p>
        )}
        <span
          className="font-medium mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ color: "#835105", fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)" }}
        >
          Explore →
        </span>
      </div>
    </Link>
  );
}

function pairCategories(cats: Category[]) {
  const rows: { left: Category; right: Category; leftFlex: number; rightFlex: number }[] = [];
  for (let i = 0; i < cats.length - 1; i += 2) {
    const isEven = rows.length % 2 === 0;
    rows.push({
      left: cats[i],
      right: cats[i + 1],
      leftFlex: isEven ? 6 : 4,
      rightFlex: isEven ? 4 : 6,
    });
  }
  return { rows, solo: cats.length % 2 !== 0 ? cats[cats.length - 1] : null };
}

export function ServiceSections() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => setCategories(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="w-full flex flex-col gap-3 p-3">
        {/* mobile: two column skeletons */}
        <div className="grid grid-cols-2 gap-2 md:hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl h-32" style={{ background: "var(--muted)" }} />
          ))}
        </div>
        {/* desktop: two column skeletons */}
        <div className="hidden md:flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="animate-pulse rounded-2xl h-28" style={{ flex: 6, background: "var(--muted)" }} />
              <div className="animate-pulse rounded-2xl h-28" style={{ flex: 4, background: "var(--muted)" }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  const { rows, solo } = pairCategories(categories);

  return (
    <section className="w-full" style={{ padding: "10px" }}>
      <div className="w-full 2xl:max-w-7xl 2xl:mx-auto flex flex-col" style={{ gap: "10px" }}>

        {/* Mobile: two columns grid */}
        <div className="grid grid-cols-2 gap-2 md:hidden">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/collection?cat=${slugify(cat.name)}`}
              className="group cursor-pointer flex flex-col items-center gap-2 px-3 py-3 rounded-2xl transition-shadow duration-300 hover:shadow-xl text-center"
              style={{ background: CARD_BG, border: `1.5px solid ${BORDER}` }}
            >
              <div
                className="shrink-0 rounded-full overflow-hidden relative transition-transform duration-500 group-hover:scale-105"
                style={{ width: 64, height: 64, background: CHOCOLATE, border: `2px solid ${BORDER}` }}
              >
                {cat.imageUrl ? (
                  <Image src={cat.imageUrl} alt={cat.name} fill unoptimized className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full" style={{ background: CHOCOLATE }} />
                )}
              </div>
              <span className="font-playball leading-tight text-sm line-clamp-1" style={{ color: CHOCOLATE }}>
                {cat.name}
              </span>
              {cat.description && (
                <p className="text-[10px] leading-snug line-clamp-2" style={{ color: "rgba(43,24,7,0.6)" }}>
                  {cat.description}
                </p>
              )}
            </Link>
          ))}
        </div>

        {/* Desktop: paired rows with alternating flex widths */}
        <div className="hidden md:flex md:flex-col" style={{ gap: "10px" }}>
          {rows.map((row, i) => (
            <div key={i} className="flex" style={{ gap: "10px" }}>
              <Panel category={row.left} flex={row.leftFlex} />
              <Panel category={row.right} flex={row.rightFlex} />
            </div>
          ))}
          {solo && (
            <div className="flex">
              <Panel category={solo} flex={1} />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
