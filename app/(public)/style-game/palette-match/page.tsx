import { StyleMatchGame } from "@/components/style-game/style-match-game";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Palette Match | Butterfly Style Studio",
  description: "Beat the clock pairing colors across 12 real Butterfly Decor moments.",
};

export default function PaletteMatchPage() {
  return <StyleMatchGame />;
}
