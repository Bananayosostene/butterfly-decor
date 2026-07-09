import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outfit Ideas",
  description:
    "Discover stylish outfit ideas and style inspiration for weddings, events, and special occasions in Rwanda. Browse bridal, groom, and party styling inspiration.",
  openGraph: {
    title: "Outfit Ideas | Butterfly Decor Rwanda",
    description:
      "Discover stylish outfit ideas and style inspiration for weddings, events, and special occasions in Rwanda.",
  },
};

export default function StyleInspirationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
