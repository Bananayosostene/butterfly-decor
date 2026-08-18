import type { Metadata } from "next";
import { OutfitBuilder } from "@/components/style-game/outfit-builder";

export const metadata: Metadata = {
  title: "Outfit Builder | Butterfly Style Studio",
  description: "Dress the bride and groom piece by piece and build a cohesive wedding-day look.",
};

export default function OutfitBuilderPage() {
  return <OutfitBuilder />;
}
