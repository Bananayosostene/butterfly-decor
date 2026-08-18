"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Palette, Grid3x3, Award, ArrowRight } from "lucide-react";
import { getAllBests, badgesEarned, totalBadgeCount, studioTitle, type GameMode } from "@/lib/game-progress";
import { BrideIcon, GroomIcon, VenueIcon } from "./composite-icons";

const CHOCOLATE = "#2b1807";
const GOLD = "#835105";
const CREAM = "#fdf6ee";
const BORDER = "#e8d5b7";

const MODES: {
  mode: GameMode;
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  pace: string;
}[] = [
  {
    mode: "paletteMatch",
    href: "/style-game/palette-match",
    title: "Palette Match",
    description: "Beat the clock pairing colors across 12 real event moments, from bouquet to cake.",
    icon: <Palette className="w-7 h-7" style={{ color: CREAM }} />,
    pace: "Fast & timed",
  },
  {
    mode: "outfitBuilder",
    href: "/style-game/outfit-builder",
    title: "Outfit Builder",
    description: "Dress the bride and groom piece by piece — gown, veil, suit, tie, and more.",
    icon: (
      <div className="flex -space-x-2">
        <BrideIcon colors={{}} className="w-7 h-9" />
        <GroomIcon colors={{}} className="w-7 h-9" />
      </div>
    ),
    pace: "Relaxed & creative",
  },
  {
    mode: "decorDesigner",
    href: "/style-game/decor-designer",
    title: "Decor Designer",
    description: "Build a full venue from the ground up — backdrop, aisle, table, and flowers.",
    icon: <VenueIcon colors={{}} className="w-10 h-8" />,
    pace: "Relaxed & creative",
  },
  {
    mode: "memoryMatch",
    href: "/style-game/memory-match",
    title: "Memory Match",
    description: "Flip cards to pair every decor piece with its perfect complementary color.",
    icon: <Grid3x3 className="w-7 h-7" style={{ color: CREAM }} />,
    pace: "Sharp & focused",
  },
];

export function StudioHub() {
  const [bests, setBests] = useState<Record<GameMode, number> | null>(null);

  useEffect(() => {
    setBests(getAllBests());
  }, []);

  const badgeCount = bests ? totalBadgeCount(bests) : 0;
  const title = studioTitle(badgeCount);

  return (
    <section className="w-full min-h-[calc(100vh-64px)] px-4 py-10 sm:py-14" style={{ background: "linear-gradient(160deg, #F5F5F7 0%, #efe6d8 100%)" }}>
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-3 mb-10">
        <span className="text-3xl">🦋</span>
        <h1 className="text-3xl sm:text-4xl font-playball" style={{ color: CHOCOLATE }}>Butterfly Style Studio</h1>
        <p className="text-sm sm:text-base max-w-lg" style={{ color: "rgba(43,24,7,0.75)" }}>
          Four ways to test your eye for color and design. Every choice is scored by real
          color-theory — no fake answers, no two rounds the same.
        </p>
        {bests && badgeCount > 0 && (
          <div className="flex items-center gap-2 mt-1 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(131,81,5,0.12)", color: GOLD }}>
            <Award className="w-3.5 h-3.5" /> {title} · {badgeCount} badge{badgeCount === 1 ? "" : "s"} earned
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-5">
        {MODES.map((m) => {
          const best = bests?.[m.mode] ?? 0;
          const badges = bests ? badgesEarned(m.mode, best) : [];
          return (
            <Link
              key={m.mode}
              href={m.href}
              className="group flex flex-col gap-3 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: CREAM, border: `1.5px solid ${BORDER}` }}
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: CHOCOLATE }}>
                  {m.icon}
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full" style={{ background: "rgba(131,81,5,0.1)", color: GOLD }}>
                  {m.pace}
                </span>
              </div>
              <h2 className="text-xl font-playball" style={{ color: CHOCOLATE }}>{m.title}</h2>
              <p className="text-sm flex-1" style={{ color: "rgba(43,24,7,0.7)" }}>{m.description}</p>

              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
                <span className="text-xs" style={{ color: "rgba(43,24,7,0.6)" }}>
                  {best > 0 ? `Best: ${best}${badges.length ? ` · ${badges[badges.length - 1]}` : ""}` : "Not played yet"}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold transition-transform group-hover:translate-x-1" style={{ color: GOLD }}>
                  Play <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto flex justify-center mt-10">
        <Link href="/collection" className="text-sm underline" style={{ color: "rgba(43,24,7,0.6)" }}>
          Skip the games, explore real collections →
        </Link>
      </div>
    </section>
  );
}
