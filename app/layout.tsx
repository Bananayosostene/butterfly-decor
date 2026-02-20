import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MagicCursor } from "../components/magic-cursor";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Decoration Events",
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
        <link href="https://fonts.googleapis.com/css2?family=Playball&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const savedTheme = localStorage.getItem('butterfly-theme');
              const savedFont = localStorage.getItem('butterfly-font');
              
              if (savedTheme) {
                const themes = [
                  { primary: 'oklch(0.7 0.15 45)', accent: 'oklch(0.8 0.12 50)', ring: 'oklch(0.7 0.15 45)' },
                  { primary: 'oklch(0.65 0.12 150)', accent: 'oklch(0.75 0.1 160)', ring: 'oklch(0.65 0.12 150)' },
                  { primary: 'oklch(0.7 0.15 35)', accent: 'oklch(0.8 0.12 40)', ring: 'oklch(0.7 0.15 35)' },
                  { primary: 'oklch(0.75 0.12 85)', accent: 'oklch(0.85 0.1 90)', ring: 'oklch(0.75 0.12 85)' },
                  { primary: 'oklch(0.65 0.15 350)', accent: 'oklch(0.75 0.12 355)', ring: 'oklch(0.65 0.15 350)' },
                  { primary: 'oklch(0.7 0.12 280)', accent: 'oklch(0.8 0.1 285)', ring: 'oklch(0.7 0.12 280)' },
                  { primary: 'oklch(0.65 0.12 200)', accent: 'oklch(0.75 0.1 210)', ring: 'oklch(0.65 0.12 200)' },
                  { primary: 'oklch(0.7 0.15 15)', accent: 'oklch(0.8 0.12 20)', ring: 'oklch(0.7 0.15 15)' }
                ];
                const theme = themes[parseInt(savedTheme)];
                if (theme) {
                  document.documentElement.style.setProperty('--primary', theme.primary);
                  document.documentElement.style.setProperty('--accent', theme.accent);
                  document.documentElement.style.setProperty('--ring', theme.ring);
                  document.documentElement.style.setProperty('--sidebar-primary', theme.primary);
                  document.documentElement.style.setProperty('--sidebar-accent', theme.accent);
                  document.documentElement.style.setProperty('--sidebar-ring', theme.ring);
                }
              }
              
              if (savedFont) {
                const fonts = [
                  'Geist, sans-serif',
                  "'Poppins', sans-serif",
                  "'Playball', cursive",
                  "'Playfair Display', serif"
                ];
                const font = fonts[parseInt(savedFont)];
                if (font && parseInt(savedFont) !== 2) {
                  document.body.style.fontFamily = font;
                }
              }
            })();
          `
        }} />
      </head>
      <body className="font-sans antialiased cursor-auto">
        <MagicCursor />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
