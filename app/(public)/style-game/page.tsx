import type { Metadata } from "next";
import { StudioHub } from "@/components/style-game/studio-hub";

export const metadata: Metadata = {
  title: "Butterfly Style Studio — Color & Design Games | Butterfly Decor",
  description:
    "Four ways to test your eye for color: Palette Match, Outfit Builder, Decor Designer, and Memory Match. See if you have what it takes to be a Butterfly Decor stylist.",
};

export default function StyleGamePage() {
  return <StudioHub />;
}
