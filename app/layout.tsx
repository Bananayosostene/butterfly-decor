import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MagicCursor } from "../components/magic-cursor";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Decorations & Clothing Rental",
  description:
    "Event decoration and outfit rental services for weddings, birthdays, and celebrations—bringing beauty, style, and confidence to every event and every person., Dutanga serivisi zo gutaka ibirori no gukodesha imyambaro y’ubwiza mu Bukwe n’ibindi birori tugafasha abantu bose kugaragara neza, bigezweho",
  icons: {
    icon: "/icon.svg",
  },
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const savedDarkMode = localStorage.getItem('butterfly-dark-mode');
              const isDark = savedDarkMode ? JSON.parse(savedDarkMode) : true;
              if (isDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            })();
          `
        }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playball&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const savedTheme = localStorage.getItem('butterfly-theme');
              
              // Set default Sunshine Bright theme
              const theme = { primary: 'oklch(0.75 0.12 85)', accent: 'oklch(0.85 0.1 90)', ring: 'oklch(0.75 0.12 85)' };
              document.documentElement.style.setProperty('--primary', theme.primary);
              document.documentElement.style.setProperty('--accent', theme.accent);
              document.documentElement.style.setProperty('--ring', theme.ring);
              document.documentElement.style.setProperty('--sidebar-primary', theme.primary);
              document.documentElement.style.setProperty('--sidebar-accent', theme.accent);
              document.documentElement.style.setProperty('--sidebar-ring', theme.ring);
            })();
          `
        }} />
      </head>
      <body className="antialiased cursor-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <MagicCursor />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
