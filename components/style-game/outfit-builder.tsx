"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Trophy, RotateCcw } from "lucide-react";
import type { HSL } from "@/lib/color-theory";
import { rankForScore } from "@/lib/color-theory";
import { saveBestIfHigher, getBest } from "@/lib/game-progress";
import { LayeredBuilder, type LayerDef, CHOCOLATE, GOLD, CREAM, BORDER } from "./layered-builder";
import { BrideIcon, GroomIcon, type BrideLayer, type GroomLayer } from "./composite-icons";

const BRIDE_LAYERS: LayerDef<BrideLayer>[] = [
  { id: "gown", label: "Gown Color", hint: "Choose the foundation color for the dress." },
  { id: "veil", label: "Veil", hint: "Pick a veil tone to soften the silhouette." },
  { id: "bouquet", label: "Bouquet", hint: "Pick blooms that complement the gown." },
  { id: "shoes", label: "Shoes", hint: "A finishing touch peeking beneath the hem." },
];

const GROOM_LAYERS: LayerDef<GroomLayer>[] = [
  { id: "suit", label: "Suit Color", hint: "Choose the foundation color for the jacket." },
  { id: "tie", label: "Bow Tie", hint: "Pick a tie that complements the suit." },
  { id: "pocketSquare", label: "Pocket Square", hint: "A small accent with a big impact." },
  { id: "shoes", label: "Shoes", hint: "Polish off the look from the ground up." },
];

type Phase = "intro" | "building" | "revealed" | "final";
type Character = "bride" | "groom";

export function OutfitBuilder() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [character, setCharacter] = useState<Character>("bride");
  const [brideColors, setBrideColors] = useState<Partial<Record<BrideLayer, HSL>>>({});
  const [groomColors, setGroomColors] = useState<Partial<Record<GroomLayer, HSL>>>({});
  const [brideDone, setBrideDone] = useState(false);
  const [groomDone, setGroomDone] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [key, setKey] = useState(0); // forces LayeredBuilder remount per character

  function startCharacter(c: Character) {
    setCharacter(c);
    setPhase("building");
    setKey((k) => k + 1);
  }

  function handleFinish(score: number, colors: Record<string, HSL>) {
    setTotalScore((s) => s + score);
    if (character === "bride") {
      setBrideColors(colors as Partial<Record<BrideLayer, HSL>>);
      setBrideDone(true);
    } else {
      setGroomColors(colors as Partial<Record<GroomLayer, HSL>>);
      setGroomDone(true);
    }
    setPhase("revealed");
  }

  function finishSession(finalScore: number) {
    const isNew = saveBestIfHigher("outfitBuilder", finalScore);
    setNewBest(isNew);
    setPhase("final");
  }

  function restart() {
    setPhase("intro");
    setCharacter("bride");
    setBrideColors({});
    setGroomColors({});
    setBrideDone(false);
    setGroomDone(false);
    setTotalScore(0);
    setNewBest(false);
  }

  return (
    <section className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10" style={{ background: "linear-gradient(160deg, #F5F5F7 0%, #efe6d8 100%)" }}>
      <div className="w-full max-w-xl rounded-3xl shadow-xl overflow-hidden" style={{ background: CREAM, border: `1.5px solid ${BORDER}` }}>
        {phase === "intro" && (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-5">
            <h1 className="text-3xl font-playball" style={{ color: CHOCOLATE }}>Outfit Builder</h1>
            <p className="text-sm max-w-md" style={{ color: "rgba(43,24,7,0.75)" }}>
              Dress the bride and groom, piece by piece. Every choice you make sets the tone for
              the next — build a look that feels intentional from head to toe.
            </p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => startCharacter("bride")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-transform hover:scale-105"
                style={{ borderColor: BORDER, background: "#fff" }}
              >
                <BrideIcon colors={{}} className="w-16 h-20" />
                <span className="text-sm font-semibold" style={{ color: CHOCOLATE }}>Style the Bride</span>
              </button>
              <button
                onClick={() => startCharacter("groom")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-transform hover:scale-105"
                style={{ borderColor: BORDER, background: "#fff" }}
              >
                <GroomIcon colors={{}} className="w-16 h-20" />
                <span className="text-sm font-semibold" style={{ color: CHOCOLATE }}>Style the Groom</span>
              </button>
            </div>
          </div>
        )}

        {phase === "building" && character === "bride" && (
          <LayeredBuilder key={key} layers={BRIDE_LAYERS} renderComposite={(c) => <BrideIcon colors={c} className="w-full h-full drop-shadow-md" />} onFinish={handleFinish} />
        )}
        {phase === "building" && character === "groom" && (
          <LayeredBuilder key={key} layers={GROOM_LAYERS} renderComposite={(c) => <GroomIcon colors={c} className="w-full h-full drop-shadow-md" />} onFinish={handleFinish} />
        )}

        {phase === "revealed" && (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-4">
            <Sparkles className="w-8 h-8" style={{ color: GOLD }} />
            <h2 className="text-2xl font-playball" style={{ color: CHOCOLATE }}>
              {character === "bride" ? "The Bride Look" : "The Groom Look"}
            </h2>
            {character === "bride" ? (
              <BrideIcon colors={brideColors} className="w-28 h-36 drop-shadow-lg" />
            ) : (
              <GroomIcon colors={groomColors} className="w-28 h-36 drop-shadow-lg" />
            )}
            <p className="text-sm font-bold" style={{ color: GOLD }}>Total so far: {totalScore} pts</p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {character === "bride" && !groomDone && (
                <button onClick={() => startCharacter("groom")} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-105" style={{ background: CHOCOLATE, color: CREAM }}>
                  Style the Groom too <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {character === "groom" && !brideDone && (
                <button onClick={() => startCharacter("bride")} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-105" style={{ background: CHOCOLATE, color: CREAM }}>
                  Style the Bride too <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => finishSession(totalScore)} className="px-6 py-2.5 rounded-full text-sm font-semibold border transition-opacity hover:opacity-80" style={{ borderColor: BORDER, color: CHOCOLATE }}>
                {brideDone && groomDone ? "See Final Score" : "Finish Here"}
              </button>
            </div>
          </div>
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
            <h2 className="text-2xl font-playball" style={{ color: CHOCOLATE }}>{rankForScore(totalScore * 2)}</h2>
            <div className="flex items-center justify-center gap-4">
              {brideDone && <BrideIcon colors={brideColors} className="w-20 h-28" />}
              {groomDone && <GroomIcon colors={groomColors} className="w-20 h-28" />}
            </div>
            <p className="text-2xl font-bold" style={{ color: CHOCOLATE }}>{totalScore} pts</p>
            <p className="text-xs" style={{ color: "rgba(43,24,7,0.6)" }}>Best: {getBest("outfitBuilder")}</p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <button onClick={restart} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-105" style={{ background: CHOCOLATE, color: CREAM }}>
                <RotateCcw className="w-4 h-4" /> Style Again
              </button>
              <Link href="/style-game" className="px-6 py-2.5 rounded-full text-sm font-semibold border transition-opacity hover:opacity-80" style={{ borderColor: BORDER, color: CHOCOLATE }}>
                Back to Studio
              </Link>
            </div>
            <Link href="/collection?cat=bridal" className="text-xs underline mt-1" style={{ color: GOLD }}>
              See real bridal & groom styles →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
