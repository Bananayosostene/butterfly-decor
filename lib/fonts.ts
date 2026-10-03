import { Playfair_Display } from "next/font/google";

// Elegant display serif for headlines. next/font self-hosts it, so there is no extra request to
// Google Fonts and no layout shift while it loads. Import it from here so it is only bundled once.
export const displaySerif = Playfair_Display({ subsets: ["latin"], weight: "500", display: "swap" });
