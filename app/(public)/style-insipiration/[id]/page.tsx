"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type StyleIdea = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  createdAt: string;
};

export default function StyleIdeaDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<StyleIdea | null>(null);
  const [related, setRelated] = useState<StyleIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/style-ideas/${id}`).then((r) => r.json()),
      fetch("/api/style-ideas").then((r) => r.json()),
    ]).then(([single, all]) => {
      const current: StyleIdea = single.data;
      setIdea(current);
      const others: StyleIdea[] = (all.data ?? []).filter((i: StyleIdea) => i.id !== id);
      setRelated(others.slice(0, 8));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen pb-16" style={{ background: "var(--background)" }}>
        {/* Detail card skeleton */}
        <div className="max-w-4xl mx-auto pt-4 px-4 md:px-8">
          <div
            className="flex flex-col md:flex-row overflow-hidden rounded-3xl"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            {/* Image skeleton */}
            <div className="w-full md:w-[55%] shrink-0 animate-pulse" style={{ minHeight: "340px", background: "var(--muted)" }} />
            {/* Info skeleton */}
            <div className="flex flex-col gap-4 p-6 md:p-8 flex-1">
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full animate-pulse" style={{ background: "var(--muted)" }} />
                <div className="h-5 w-20 rounded-full animate-pulse" style={{ background: "var(--muted)" }} />
              </div>
              <div className="h-8 w-3/4 rounded-xl animate-pulse" style={{ background: "var(--muted)" }} />
              <div className="h-4 w-full rounded animate-pulse" style={{ background: "var(--muted)" }} />
              <div className="h-4 w-5/6 rounded animate-pulse" style={{ background: "var(--muted)" }} />
              <div className="border-t" style={{ borderColor: "var(--border)" }} />
              <div className="h-11 rounded-full animate-pulse" style={{ background: "var(--muted)" }} />
              <div className="h-3 w-32 rounded mx-auto animate-pulse" style={{ background: "var(--muted)" }} />
            </div>
          </div>
        </div>
        {/* Related skeletons */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-3">
                <div
                  className="w-full rounded-2xl animate-pulse"
                  style={{ background: "var(--muted)", aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/5" }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--background)" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Idea not found.</p>
        <button onClick={() => router.back()} className="text-sm underline" style={{ color: "var(--primary)" }}>Go back</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-16" style={{ background: "var(--background)" }}>
   
      {/* Pin card — Pinterest style */}
      <div className="max-w-4xl mx-auto pt-4 px-4 md:px-8">
        <div
          className="flex flex-col md:flex-row overflow-hidden rounded-3xl shadow-xl"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          {/* Left — image */}
          <div className="relative w-full md:w-[55%] shrink-0" style={{ minHeight: "340px" }}>
            <Image
              src={idea.imageUrl}
              alt={idea.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 55vw"
              priority
            />
          </div>

          {/* Right — info */}
          <div className="flex flex-col gap-5 p-6 md:p-8 flex-1">


            {/* Title */}
            <h1
              className="text-2xl md:text-3xl leading-snug"
              style={{ fontFamily: "'Playball', cursive", color: "var(--primary)", fontWeight: 400 }}
            >
              {idea.title}
            </h1>

            {/* Description */}
            {idea.description && (
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}
              >
                {idea.description}
              </p>
            )}

            {/* Divider */}
            <div className="border-t" style={{ borderColor: "var(--border)" }} />

            {/* CTA */}
            <a
              href="https://wa.me/+250788724867?text=Hello%20Butterfly%20Decor%2C%20I%20love%20this%20style%20idea%20and%20would%20like%20to%20book%20it%20for%20my%20event!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
              Book this style
            </a>

            <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
              Added {new Date(idea.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Related ideas */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {related.map((item, idx) => (
              <div
                key={item.id}
                className="break-inside-avoid mb-3 group cursor-pointer"
                onClick={() => router.push(`/style-insipiration/${item.id}`)}
              >
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{ aspectRatio: idx % 3 === 0 ? "3/4" : idx % 3 === 1 ? "1/1" : "4/5" }}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3"
                    style={{ background: "linear-gradient(to top, rgba(30,16,8,0.85) 0%, transparent 60%)" }}
                  >
                    <p className="text-xs font-semibold" style={{ color: "#e8d5b7" }}>{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
