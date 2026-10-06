"use client";

import { useState } from "react";
import { displaySerif } from "@/lib/fonts";

export function WeddingShopHero({ videoSrc }: { videoSrc: string }) {
  const [videoAvailable, setVideoAvailable] = useState(true);

  // With the video visible, text sits on a dark warm scrim (brand chocolate).
  // Without it, we fall back to the plain cream gradient with dark text — never mix the two.
  const label = videoAvailable ? "#e8c078" : "#835105";
  const heading = videoAvailable ? "#fdf6ee" : "#2b1807";
  const paragraph = videoAvailable ? "#f0e6d6" : "#57422C";
  const highlight = videoAvailable ? "#e6c081" : "#835105";
  const secondaryBorder = videoAvailable ? "rgba(253,246,238,0.55)" : "#57422C";
  const secondaryText = videoAvailable ? "#fdf6ee" : "#2b1807";

  return (
    <section
      className="w-full h-[60vh] md:h-[calc(100vh-64px)] flex items-center overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, #fdf6ee 0%, #f5e6d3 30%, #ede0d4 55%, #e8d5b7 80%, #fdf6ee 100%)",
      }}
    >
      {videoAvailable && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoAvailable(false)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
      {videoAvailable && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(100deg, rgba(43,24,7,0.78) 0%, rgba(43,24,7,0.45) 32%, rgba(43,24,7,0.16) 55%, rgba(43,24,7,0.4) 100%)",
            zIndex: 1,
          }}
        />
      )}
      {videoAvailable && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(43,24,7,0.55) 0%, transparent 45%)",
            zIndex: 1,
          }}
        />
      )}

      {/* soft radial glow top-left */}
      <div
        className="absolute top-0 left-0 w-[60%] h-[60%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(180,120,60,0.13) 0%, transparent 70%)",
          zIndex: 2,
        }}
      />
      {/* soft radial glow bottom-right */}
      <div
        className="absolute bottom-0 right-0 w-[50%] h-[50%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at bottom right, rgba(139,90,43,0.10) 0%, transparent 70%)",
          zIndex: 2,
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-14 md:py-0" style={{ zIndex: 3 }}>
        <div className="flex flex-col items-start gap-5 w-full max-w-xl">
          <p
            className="text-xs md:text-sm font-semibold uppercase tracking-[0.22em]"
            style={{ color: heading, opacity: 0.9 }}
          >
            Where beauty meets beauty.
          </p>
          <h1
            className={`${displaySerif.className} -mt-2 text-2xl md:text-4xl leading-[1.05] max-w-xl`}
            style={{
              color: heading,
              fontWeight: 500,
              textShadow: videoAvailable ? "0 1px 12px rgba(0,0,0,0.25)" : "none",
            }}
          >
            The Free Online Wedding Planner Website
          </h1>

          {/* Plain GET form: works before JavaScript loads and lands on /wedding-planning?date=… */}
          <form
            action="/wedding-planning"
            className="mt-2 w-full max-w-lg flex items-center gap-2 p-1.5 pl-5 rounded-full shadow-lg"
            style={{ background: "#f7efe3" }}
          >
            {/* Native date field: the browser keeps the mm/dd/yyyy segments and rejects impossible
                values (month above 12, day above the month's length). Clicking the text only lets
                the visitor type; the calendar opens only from its icon. */}
            <input
              // Date fields can't show a placeholder, so it starts as text and becomes a date field
              // (mm/dd/yyyy) when clicked; it goes back to the placeholder if left empty.
              type="text"
              name="date"
              placeholder="What's your wedding date?"
              aria-label="Wedding date"
              onFocus={(e) => {
                e.currentTarget.type = "date";
              }}
              onBlur={(e) => {
                if (!e.currentTarget.value) e.currentTarget.type = "text";
              }}
              className="min-w-0 flex-1 bg-transparent text-sm md:text-base outline-none py-2"
              style={{ color: "#2b1807" }}
            />
            <button
              type="submit"
              className="shrink-0 px-5 md:px-7 py-3 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-90 cursor-pointer"
              style={{ background: "#2b1807", color: "#f7efe3" }}
            >
              Start planning
            </button>
          </form>
          <p className="pl-5 text-sm" style={{ color: paragraph }}>
            Already have an account?{" "}
            <a href="/login" className="font-bold underline-offset-4 hover:underline" style={{ color: heading }}>
              Sign in
            </a>
            <span className="mx-2 opacity-60">·</span>
            New here?{" "}
            <a href="/login?tab=register" className="font-bold underline-offset-4 hover:underline" style={{ color: heading }}>
              Create an account
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
