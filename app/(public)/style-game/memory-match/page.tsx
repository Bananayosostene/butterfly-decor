import type { Metadata } from "next";
import { MemoryMatch } from "@/components/style-game/memory-match";

export const metadata: Metadata = {
  title: "Memory Match | Butterfly Style Studio",
  description: "Flip cards to pair every decor piece with its perfect complementary color.",
};

export default function MemoryMatchPage() {
  return <MemoryMatch />;
}
