"use client";

import { useEffect, useRef, useState } from "react";

export function MagicCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const savedCursor = localStorage.getItem("butterfly-cursor");
    if (savedCursor !== null) {
      setIsEnabled(JSON.parse(savedCursor));
    }

    const handleCursorToggle = (e: CustomEvent) => {
      setIsEnabled(e.detail);
    };

    window.addEventListener('cursorToggle', handleCursorToggle as EventListener);
    return () => window.removeEventListener('cursorToggle', handleCursorToggle as EventListener);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const updateMousePosition = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0)`;
      }

      if (ringRef.current) {
        const size = ringRef.current.classList.contains("hovered") ? 40 : 24;
        const offset = size / 2;

        ringRef.current.style.transform = `translate3d(${x - offset}px, ${y - offset}px, 0)`;
      }
    };

    const handleMouseEnter = () => {
      if (ringRef.current) {
        ringRef.current.classList.add("hovered");
        ringRef.current.style.width = "40px";
        ringRef.current.style.height = "40px";
        ringRef.current.style.border =
          "1px solid oklch(from var(--primary) l c h / 0.3)";
        ringRef.current.style.backgroundColor =
          "oklch(from var(--primary) l c h / 0.1)";
      }
    };

    const handleMouseLeave = () => {
      if (ringRef.current) {
        ringRef.current.classList.remove("hovered");
        ringRef.current.style.width = "24px";
        ringRef.current.style.height = "24px";
        ringRef.current.style.border =
          "1px solid oklch(from var(--primary) l c h / 0.6)";
        ringRef.current.style.backgroundColor = "transparent";
      }
    };

    const interactiveElements = document.querySelectorAll(
      'a, button, input, textarea, select, [role="button"], .cursor-pointer',
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    document.addEventListener("mousemove", updateMousePosition);

    return () => {
      document.removeEventListener("mousemove", updateMousePosition);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="hidden sm:block fixed pointer-events-none z-[9999] w-2 h-2 rounded-full transition-transform duration-75"
        style={{
          backgroundColor: "var(--primary)",
          boxShadow: "0 0 12px 4px oklch(from var(--primary) l c h / 0.5)",
        }}
      />

      <div
        ref={ringRef}
        className="hidden sm:block fixed pointer-events-none z-[9998] w-6 h-6 rounded-full transition-all duration-150"
        style={{
          border: "1px solid oklch(from var(--primary) l c h / 0.6)",
        }}
      />
    </>
  );
}
