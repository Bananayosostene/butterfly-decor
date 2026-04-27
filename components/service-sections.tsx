"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Category = { id: string; name: string; description?: string; imageUrl?: string };

const CHOCOLATE = "#2b1807";

function Panel({ category, flex }: { category: Category; flex: number }) {
  return (
    <Link
      href={`/collection?collection=${encodeURIComponent(category.name)}`}
      className="relative overflow-hidden group cursor-pointer shrink-0"
      style={{
        flex,
        backgroundColor: !category.imageUrl ? CHOCOLATE : undefined,
      }}
    >
      {category.imageUrl && (
        <Image
          key={category.imageUrl}
          src={category.imageUrl}
          alt={category.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="60vw"
        />
      )}
      {/* gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(to top, rgba(30,16,8,0.75) 0%, transparent 55%)",
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <span
          className="text-2xl md:text-3xl font-playball"
          style={{ color: "#e8d5b7" }}
        >
          {category.name}
        </span>
        {category.description && (
          <p
            className="text-xs mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ color: "rgba(232,213,183,0.8)" }}
          >
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
}

// Pair categories into rows of 2, last row gets a single full-width panel if odd count
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
      <section className="w-full flex flex-col gap-2 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-2 h-[50vh] md:h-[60vh]">
            <div className="animate-pulse rounded-sm" style={{ flex: 6, background: "var(--muted)" }} />
            <div className="animate-pulse rounded-sm" style={{ flex: 4, background: "var(--muted)" }} />
          </div>
        ))}
      </section>
    );
  }

  if (categories.length === 0) return null;

  const { rows, solo } = pairCategories(categories);

  return (
    <section className="w-full" style={{ padding: "8px" }}>
      <div className="w-full 2xl:max-w-7xl 2xl:mx-auto flex flex-col" style={{ gap: "8px" }}>
        {rows.map((row, i) => (
          <div key={i} className="flex h-[50vh] md:h-[60vh]" style={{ gap: "8px" }}>
            <Panel category={row.left} flex={row.leftFlex} />
            <Panel category={row.right} flex={row.rightFlex} />
          </div>
        ))}
        {/* Odd last category — full width, shorter height */}
        {solo && (
          <div className="flex h-[35vh] md:h-[40vh]">
            <Panel category={solo} flex={1} />
          </div>
        )}
      </div>
    </section>
  );
}
