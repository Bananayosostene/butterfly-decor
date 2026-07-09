import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse our complete collection of wedding decorations, bridal gowns, groom suits, birthday decorations, gift wrapping, invitations, and more in Rwanda.",
  openGraph: {
    title: "Collections | Butterfly Decor Rwanda",
    description:
      "Browse our complete collection of wedding decorations, bridal gowns, groom suits, birthday decorations, and more in Rwanda.",
  },
};

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
