import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.butterflydec.com";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse our complete collection of wedding decorations, bridal gowns, groom suits, birthday decorations, gift wrapping, invitations, and event decor in Rwanda.",
  openGraph: {
    title: "Collections | Butterfly Decor Rwanda",
    description:
      "Browse our complete collection of wedding decorations, bridal gowns, groom suits, birthday decorations, and more in Rwanda.",
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
