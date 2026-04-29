import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ModalProvider } from "@/components/modal-provider";
import { JsonLd } from "@/components/json-ld";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://butterfly-decor.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Butterfly Decor | Event Decoration & Outfit Rental in Rwanda",
    template: "%s | Butterfly Decor Rwanda",
  },
  description:
    "Butterfly Decor Rwanda — premium event decoration and outfit rental for weddings, birthdays, church events and celebrations in Rwanda. Bridal gowns, groom suits, gift wrapping, invitations and more. | Serivisi zo gutaka ibirori mu Rwanda: impuzu z'ubukwe, gutaka ubukwe, impakira ingabire n'ibindi.",
  keywords: [
    // English
    "butterfly decor",
    "butterflydecor.rw",
    "butterfly decor Rwanda",
    "event decoration Rwanda",
    "event decoration Kigali",
    "wedding decoration Rwanda",
    "wedding decoration Kigali",
    "wedding decor Rwanda",
    "wedding tools Rwanda",
    "wedding accessories Rwanda",
    "wedding planner Rwanda",
    "wedding venue decoration",
    "bridal gown Rwanda",
    "bridal dress Rwanda",
    "bride dress Kigali",
    "groom suits Rwanda",
    "outfit rental Rwanda",
    "birthday decoration Kigali",
    "birthday party decoration Rwanda",
    "church event decoration Rwanda",
    "memorial decoration Rwanda",
    "gift wrapping Rwanda",
    "wedding invitations Rwanda",
    "event planner Rwanda",
    "decor studio Rwanda",
    "decoration studio Kigali",
    "floral arrangements Rwanda",
    "balloon decoration Rwanda",
    "table styling Rwanda",
    "photo backdrop Rwanda",
    "catering Rwanda",
    "event photography Rwanda",
    // Kinyarwanda
    "gutaka ibirori Rwanda",
    "gutaka ubukwe Rwanda",
    "impuzu z'ubukwe Rwanda",
    "icyenda cy'umugeni",
    "icyenda cy'umugabo w'ubukwe",
    "gutegura ibirori Kigali",
    "gutegura ubukwe Rwanda",
    "ibikoresho by'ubukwe Rwanda",
    "ibikoresho byo gutaka ibirori",
    "serivisi zo gutaka ibirori",
    "gutaka inzu y'ibirori",
    "impapuro z'ubutumire",
    "impakira ingabire Rwanda",
    "ibirori byo gutunga Rwanda",
    "décoration mariage Rwanda",
  ],
  authors: [{ name: "Butterfly Decor", url: BASE_URL }],
  creator: "Butterfly Decor",
  publisher: "Butterfly Decor",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_RW",
    alternateLocale: "rw_RW",
    url: BASE_URL,
    siteName: "Butterfly Decor Rwanda",
    title: "Butterfly Decor | Event Decoration & Outfit Rental in Rwanda",
    description:
      "Premium event decoration and outfit rental for weddings, birthdays and celebrations in Rwanda. Bridal gowns, groom suits, gift wrapping, invitations and more. | Serivisi zo gutaka ibirori mu Rwanda: impuzu z'ubukwe, gutaka ubukwe, impakira ingabire, n'ibindi.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Butterfly Decor Rwanda — Event Decoration & Outfit Rental",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Butterfly Decor | Event Decoration & Outfit Rental in Rwanda",
    description:
      "Premium event decoration and outfit rental for weddings, birthdays and celebrations in Rwanda.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "en-RW": BASE_URL,
      "rw": `${BASE_URL}/rw`,
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-RW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playball&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased cursor-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} suppressHydrationWarning>
        {children}
        <JsonLd />
        <ModalProvider />
        <Analytics />
      </body>
    </html>
  );
}
