import type { Metadata } from "next";
import { DecorDesigner } from "@/components/style-game/decor-designer";

export const metadata: Metadata = {
  title: "Decor Designer | Butterfly Style Studio",
  description: "Build a full wedding venue from backdrop to centerpiece, one color at a time.",
};

export default function DecorDesignerPage() {
  return <DecorDesigner />;
}
