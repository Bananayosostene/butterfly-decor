import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.butterflydec.com";

export const metadata: Metadata = {
  // Shown as the page name in Google; the site name is added after it by the root layout.
  title: "Wedding Decor & Outfits rantals in Rwanda",
  description: "See the bridal gowns, groom suits, imikenyero, wedding backdrops, flowers and cakes Butterfly Decor has for rent in Kigali, Rwanda, and book what you like.",
  openGraph: {
    title: "Wedding Decor and Outfit Rentals by Butterfly Decor Rwanda",
    description: "See the bridal gowns, groom suits, imikenyero, wedding backdrops, flowers and cakes Butterfly Decor has for rent in Kigali, Rwanda, and book what you like.",
    url: `${BASE_URL}/collection`,
  },
  alternates: {
    canonical: `${BASE_URL}/collection`,
  },
};

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
