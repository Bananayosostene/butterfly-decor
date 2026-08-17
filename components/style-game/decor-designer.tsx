"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Trophy, RotateCcw } from "lucide-react";
import type { HSL } from "@/lib/color-theory";
import { rankForScore } from "@/lib/color-theory";
import { saveBestIfHigher, getBest } from "@/lib/game-progress";
import { LayeredBuilder, type LayerDef, CHOCOLATE, GOLD, CREAM, BORDER } from "./layered-builder";
import { VenueIcon, type VenueLayer } from "./composite-icons";

const VENUE_LAYERS: LayerDef<VenueLayer>[] = [
  { id: "backdrop", label: "Ceremony Backdrop", hint: "Choose the foundation color for the drape." },
  { id: "runner", label: "Aisle Runner", hint: "Pick a runner tone that leads the eye forward." },
  { id: "linen", label: "Table Linen", hint: "Set the base for the reception tables." },
  { id: "centerpiece", label: "Centerpiece Flowers", hint: "Blooms that tie the table together." },
  { id: "chairSash", label: "Chair Sash", hint: "The finishing ribbon on every seat." },
];

type Phase = "intro" | "building" | "final";

export function DecorDesigner() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [colors, setColors] = useState<Partial<Record<VenueLayer, HSL>>>({});
  const [score, setScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [key, setKey] = useState(0);

  function start() {
    setPhase("building");
    setKey((k) => k + 1);
  }

  function handleFinish(finalScore: number, finalColors: Record<VenueLayer, HSL>) {
    setScore(finalScore);
    setColors(finalColors);
    const isNew = saveBestIfHigher("decorDesigner", finalScore);
    setNewBest(isNew);
    setPhase("final");
  }

  function restart() {
    setPhase("intro");
    setColors({});
    setScore(0);
    setNewBest(false);
  }

  return (
    <section className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10" style={{ background: "linear-gradient(160deg, #F5F5F7 0%, #efe6d8 100%)" }}>
      <div className="w-full max-w-xl rounded-3xl shadow-xl overflow-hidden" style={{ background: CREAM, border: `1.5px solid ${BORDER}` }}>
        {phase === "intro" && (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-5">
            <h1 className="text-3xl font-playball" style={{ color: CHOCOLATE }}>Decor Designer</h1>
            <p className="text-sm max-w-md" style={{ color: "rgba(43,24,7,0.75)" }}>
              Build an entire venue from the ground up — backdrop, aisle, table, flowers, and
              chairs. Five choices, one cohesive room.
            </p>
            <VenueIcon colors={{}} className="w-40 h-32" />
            <button
              onClick={start}
              className="px-8 py-3 rounded-full text-sm font-semibold transition-transform hover:scale-105"
              style={{ background: CHOCOLATE, color: CREAM }}
            >
              Start Designing
            </button>
          </div>
        )}

        {phase === "building" && (
          <LayeredBuilder
            key={key}
            layers={VENUE_LAYERS}
            renderComposite={(c) => <VenueIcon colors={c} className="w-full h-full drop-shadow-md" />}
            onFinish={handleFinish}
          />
        )}

        {phase === "final" && (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: GOLD }}>
              <Trophy className="w-8 h-8" style={{ color: CREAM }} />
            </div>
            {newBest && (
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(131,81,5,0.15)", color: GOLD }}>
                ✨ New personal best!
              </span>
            )}
            <h2 className="text-2xl font-playball" style={{ color: CHOCOLATE }}>{rankForScore(score * 2)}</h2>
            <VenueIcon colors={colors} className="w-48 h-36 drop-shadow-lg" />
            <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: GOLD }}>
              <Sparkles className="w-4 h-4" /> Your venue is ready
            </div>
            <p className="text-2xl font-bold" style={{ color: CHOCOLATE }}>{score} pts</p>
            <p className="text-xs" style={{ color: "rgba(43,24,7,0.6)" }}>Best: {getBest("decorDesigner")}</p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <button onClick={restart} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-105" style={{ background: CHOCOLATE, color: CREAM }}>
                <RotateCcw className="w-4 h-4" /> Design Again
              </button>
              <Link href="/style-game" className="px-6 py-2.5 rounded-full text-sm font-semibold border transition-opacity hover:opacity-80" style={{ borderColor: BORDER, color: CHOCOLATE }}>
                Back to Studio
              </Link>
            </div>
            <Link href="/collection?cat=decor" className="text-xs underline mt-1" style={{ color: GOLD }}>
              See real decor collections →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
