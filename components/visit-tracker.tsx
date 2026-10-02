"use client";

import { useEffect } from "react";

/** Records one visit per browser session. Renders nothing. */
export function VisitTracker() {
  useEffect(() => {
    if (!sessionStorage.getItem("bfly-visited")) {
      sessionStorage.setItem("bfly-visited", "1");
      fetch("/api/track", { method: "POST" }).catch(() => {});
    }
  }, []);

  return null;
}
