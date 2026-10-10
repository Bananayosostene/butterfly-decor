"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const KEY = "bfly-visit";

type Visit = { id: string | null; seconds: number; pages: number; lastPath: string };

const read = (): Visit | null => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
};
const write = (visit: Visit) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(visit));
  } catch {}
};

/** The dashboard is not a visit to the site. */
const isSitePage = (path: string) => !path.startsWith("/account") || path.startsWith("/account/welcome");

/** Details only the browser knows. The phone model comes from Chrome when it is willing to say. */
async function deviceDetails() {
  const nav = navigator as any;
  let hints: { model?: string; platformVersion?: string } = {};
  try {
    hints = (await nav.userAgentData?.getHighEntropyValues(["model", "platformVersion"])) ?? {};
  } catch {}
  return {
    path: location.pathname + location.search,
    referrer: document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : "",
    screen: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connection: nav.connection?.effectiveType ?? "",
    model: hints.model ?? "",
    // Chrome reports Windows 11 as platform version 13 and up; other systems report their real version.
    osVersion: nav.userAgentData?.platform === "Windows" ? (parseInt(hints.platformVersion ?? "0", 10) >= 13 ? "11" : hints.platformVersion ? "10" : "") : hints.platformVersion ?? "",
  };
}

/**
 * Records one visit per browser session, then reports how long the visitor stayed and how many
 * pages they opened. Only time with the page actually on screen is counted. Renders nothing.
 */
export function VisitTracker() {
  const pathname = usePathname();

  // Start the visit (once per session) and count pages.
  useEffect(() => {
    if (!isSitePage(pathname)) return;
    const visit = read();
    if (visit) {
      if (visit.lastPath !== pathname) write({ ...visit, pages: visit.pages + 1, lastPath: pathname });
      return;
    }
    write({ id: null, seconds: 0, pages: 1, lastPath: pathname });
    deviceDetails()
      .then((details) => fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(details) }))
      .then((res) => res.json())
      .then((json) => {
        const current = read();
        if (json?.id && current) write({ ...current, id: json.id });
      })
      .catch(() => {});
  }, [pathname]);

  // Count the time on screen and report it whenever the visitor leaves or hides the page.
  useEffect(() => {
    let shownAt = document.visibilityState === "visible" ? Date.now() : 0;

    const report = () => {
      const visit = read();
      if (!visit || !shownAt) return;
      const next = { ...visit, seconds: visit.seconds + Math.round((Date.now() - shownAt) / 1000) };
      shownAt = 0;
      write(next);
      if (next.id) navigator.sendBeacon("/api/track", new Blob([JSON.stringify({ id: next.id, seconds: next.seconds, pages: next.pages })], { type: "application/json" }));
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") report();
      else shownAt = Date.now();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", report);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", report);
      report();
    };
  }, []);

  return null;
}
