import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Butterfly Decor Rwanda — Event Decoration & Outfit Rental",
    short_name: "Butterfly Decor",
    description:
      "Premium event decoration and outfit rental for weddings, birthdays, church events and celebrations in Rwanda.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf6ee",
    theme_color: "#8B4513",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
