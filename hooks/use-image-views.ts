"use client";

import { useEffect, useRef, useState } from "react";

/** Which kind of image a view belongs to: a collection item, an album photo or a vendor photo. */
export type ViewKind = "ITEM" | "ALBUM" | "VENDOR";

/** Key of an album photo: the file name at the end of its address (it stays the same if photos are reordered). */
export const albumPhotoKey = (url: string) => (url.split("/").pop() ?? url).replace(/[^\w.-]/g, "").slice(0, 80);

/** Images sent to the server in one request. */
const BATCH = 40;

/**
 * Records which images a visitor has seen and gives back how many people viewed each one.
 * An image counts as seen when it is opened, or when at least half of it scrolls onto the
 * screen. Each device counts once per image; the server keeps the totals.
 */
export function useImageViews(kind: ViewKind) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const sent = useRef(new Set<string>());
  const pending = useRef(new Set<string>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const keyOf = useRef(new WeakMap<Element, string>());

  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const keys = [...pending.current].slice(0, BATCH);
    if (!keys.length) return;
    keys.forEach((key) => pending.current.delete(key));
    fetch("/api/views", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, keys }) })
      .then((res) => res.json())
      .then((json) => json?.counts && setCounts((current) => ({ ...current, ...json.counts })))
      .catch(() => {});
    if (pending.current.size) timer.current = setTimeout(flush, 300);
  };

  /** Marks an image as seen. `now` sends it straight away (used when an image is opened). */
  const viewed = (key: string, now = false) => {
    if (!sent.current.has(key)) {
      sent.current.add(key);
      pending.current.add(key);
    }
    if (now) flush();
    else if (pending.current.size && !timer.current) timer.current = setTimeout(flush, 1500);
  };

  // Whatever is still waiting goes out when the visitor leaves the page or hides it.
  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      observer.current?.disconnect();
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** `ref={seenRef(key)}` on an image tile: it counts as seen once half of it is on screen. */
  const seenRef = (key: string) => (element: Element | null) => {
    if (!element || sent.current.has(key)) return;
    observer.current ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const seenKey = keyOf.current.get(entry.target);
          if (seenKey) viewed(seenKey);
          observer.current?.unobserve(entry.target);
        }
      },
      { threshold: 0.5 },
    );
    keyOf.current.set(element, key);
    observer.current.observe(element);
  };

  return { counts, seenRef, viewed };
}
