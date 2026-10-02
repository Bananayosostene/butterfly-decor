"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Infinite scroll without client-side data fetching: when the sentinel scrolls into view we
 * bump `?page=` in the URL and the server page re-renders with the longer list.
 */
export function useLoadMore(page: number, hasMore: boolean) {
  const router = useRouter();
  const [loadingMore, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(page + 1));
        startTransition(() => {
          router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        });
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, hasMore, loadingMore, router]);

  return { sentinelRef, loadingMore };
}
