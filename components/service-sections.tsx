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
      className="group cursor-pointer shrink-0 flex items-center gap-4 md:gap-6 px-5 md:px-8 py-5 rounded-2xl transition-shadow duration-300 hover:shadow-xl"
      style={{
        flex,
        background: CARD_BG,
        border: `1.5px solid ${BORDER}`,
        minHeight: "120px",
      }}
    >
      {/* Circle image */}
      <div
        className="shrink-0 rounded-full overflow-hidden transition-transform duration-500 group-hover:scale-105"
        style={{
          width: "clamp(100px, 14vw, 160px)",
          height: "clamp(100px, 14vw, 160px)",
          background: CHOCOLATE,
          border: `3px solid ${BORDER}`,
          position: "relative",
        }}
      >
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            unoptimized
            className="object-cover"
            sizes="120px"
          />
        ) : (
          <div className="w-full h-full" style={{ background: CHOCOLATE }} />
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1 min-w-0">
        <span
          className="font-playball leading-tight truncate"
          style={{
            color: CHOCOLATE,
            fontSize: "clamp(1rem, 2vw, 1.5rem)",
          }}
        >
          {category.name}
        </span>
        {category.description && (
          <p
            className="text-xs md:text-sm leading-relaxed line-clamp-3"
            style={{ color: "rgba(43,24,7,0.65)" }}
          >
            {category.description}
          </p>
        )}
        <span
          className="text-xs font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ color: "#835105" }}
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
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="animate-pulse rounded-2xl h-28" style={{ flex: 6, background: "var(--muted)" }} />
            <div className="animate-pulse rounded-2xl h-28" style={{ flex: 4, background: "var(--muted)" }} />
          </div>
        ))}
      </section>
    );
  }

  if (categories.length === 0) return null;

  const { rows, solo } = pairCategories(categories);

  return (
    <section className="w-full" style={{ padding: "10px" }}>
      <div className="w-full 2xl:max-w-7xl 2xl:mx-auto flex flex-col" style={{ gap: "10px" }}>
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
    </section>
  );
}
