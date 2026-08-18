"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trophy, RotateCcw, Timer, Gauge } from "lucide-react";
import { type HSL, hslToCss, randomDesignerColor, bestComplementFor, rankForScore } from "@/lib/color-theory";
import { saveBestIfHigher, getBest } from "@/lib/game-progress";
import { SceneIcon, type SceneId } from "./scene-icon";

const CHOCOLATE = "#2b1807";
const GOLD = "#835105";
const CREAM = "#fdf6ee";
const BORDER = "#e8d5b7";

const PAIR_SCENES: SceneId[] = ["bouquet", "suit", "tableSetting", "giftBox", "cake", "backdrop"];
const TOTAL_PAIRS = PAIR_SCENES.length;

type CardData = {
  id: string;
  pairId: string;
  kind: "item" | "color";
  scene?: SceneId;
  color: HSL;
  flipped: boolean;
  matched: boolean;
};

function buildDeck(): CardData[] {
  const cards: CardData[] = [];
  PAIR_SCENES.forEach((scene) => {
    const base = randomDesignerColor();
    const partner = bestComplementFor(base);
    cards.push({ id: `${scene}-item`, pairId: scene, kind: "item", scene, color: base, flipped: false, matched: false });
    cards.push({ id: `${scene}-color`, pairId: scene, kind: "color", color: partner, flipped: false, matched: false });
  });
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

type Phase = "intro" | "playing" | "done";

export function MemoryMatch() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matchesFound, setMatchesFound] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [newBest, setNewBest] = useState(false);

  function start() {
    setCards(buildDeck());
    setFlippedIds([]);
    setLocked(false);
    setMoves(0);
    setMatchesFound(0);
    setStartTime(Date.now());
    setElapsed(0);
    setPhase("playing");
  }

  // live timer
  useEffect(() => {
    if (phase !== "playing" || !startTime) return;
    const t = setInterval(() => setElapsed((Date.now() - startTime) / 1000), 200);
    return () => clearInterval(t);
  }, [phase, startTime]);

  // completion — computed from fresh committed state, not a stale timeout closure
  useEffect(() => {
    if (phase !== "playing" || matchesFound < TOTAL_PAIRS) return;
    const finalElapsed = startTime ? (Date.now() - startTime) / 1000 : elapsed;
    const score = Math.max(50, Math.round(900 - Math.max(0, moves - TOTAL_PAIRS) * 35 - finalElapsed * 4));
    setFinalScore(score);
    setNewBest(saveBestIfHigher("memoryMatch", score));
    setPhase("done");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchesFound, phase]);

  function handleFlip(cardId: string) {
    if (locked || phase !== "playing") return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched || flippedIds.length === 2) return;

    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, flipped: true } : c)));
    const nextFlipped = [...flippedIds, cardId];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [aId, bId] = nextFlipped;
      const a = cards.find((c) => c.id === aId)!;
      const b = cards.find((c) => c.id === bId)!;

      if (a.pairId === b.pairId) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === aId || c.id === bId ? { ...c, matched: true } : c)));
          setFlippedIds([]);
          setMatchesFound((n) => n + 1);
        }, 450);
      } else {
        setLocked(true);
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === aId || c.id === bId ? { ...c, flipped: false } : c)));
          setFlippedIds([]);
          setLocked(false);
        }, 850);
      }
    }
  }

  const grid = useMemo(() => cards, [cards]);

  return (
    <section className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10" style={{ background: "linear-gradient(160deg, #F5F5F7 0%, #efe6d8 100%)" }}>
      <div className="w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden" style={{ background: CREAM, border: `1.5px solid ${BORDER}` }}>
        {phase === "intro" && (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-5">
            <h1 className="text-3xl font-playball" style={{ color: CHOCOLATE }}>Memory Match</h1>
            <p className="text-sm max-w-md" style={{ color: "rgba(43,24,7,0.75)" }}>
              Flip two cards at a time. Every decor piece has a perfect complementary color hiding
              somewhere on the board — remember where you saw it and pair them all before your
              moves add up.
            </p>
            <button onClick={start} className="px-8 py-3 rounded-full text-sm font-semibold transition-transform hover:scale-105" style={{ background: CHOCOLATE, color: CREAM }}>
              Start Matching
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div className="p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4 text-sm font-semibold" style={{ color: CHOCOLATE }}>
              <span className="flex items-center gap-1.5"><Gauge className="w-4 h-4" /> {moves} moves</span>
              <span>{matchesFound} / {TOTAL_PAIRS} matched</span>
              <span className="flex items-center gap-1.5"><Timer className="w-4 h-4" /> {elapsed.toFixed(1)}s</span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {grid.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleFlip(card.id)}
                  disabled={card.flipped || card.matched}
                  className="aspect-square rounded-xl flex items-center justify-center transition-transform hover:scale-[1.03] disabled:hover:scale-100"
                  style={{
                    background: card.flipped || card.matched ? "#fff" : CHOCOLATE,
                    border: `1.5px solid ${card.matched ? GOLD : BORDER}`,
                    opacity: card.matched ? 0.55 : 1,
                  }}
                >
                  {card.flipped || card.matched ? (
                    card.kind === "item" ? (
                      <SceneIcon scene={card.scene!} base={card.color} className="w-3/4 h-3/4" />
                    ) : (
                      <span className="w-2/3 h-2/3 rounded-full shadow-inner" style={{ background: hslToCss(card.color) }} />
                    )
                  ) : (
                    <span className="text-lg" style={{ color: "rgba(232,213,183,0.5)" }}>🦋</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: GOLD }}>
              <Trophy className="w-8 h-8" style={{ color: CREAM }} />
            </div>
            {newBest && (
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(131,81,5,0.15)", color: GOLD }}>
                ✨ New personal best!
              </span>
            )}
            <h2 className="text-2xl font-playball" style={{ color: CHOCOLATE }}>{rankForScore(finalScore * 1.3)}</h2>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold" style={{ color: CHOCOLATE }}>{finalScore}</p>
                <p className="text-xs" style={{ color: "rgba(43,24,7,0.6)" }}>Score</p>
              </div>
              <div className="w-px h-8" style={{ background: BORDER }} />
              <div>
                <p className="text-2xl font-bold" style={{ color: CHOCOLATE }}>{moves}</p>
                <p className="text-xs" style={{ color: "rgba(43,24,7,0.6)" }}>Moves</p>
              </div>
              <div className="w-px h-8" style={{ background: BORDER }} />
              <div>
                <p className="text-2xl font-bold" style={{ color: CHOCOLATE }}>{elapsed.toFixed(1)}s</p>
                <p className="text-xs" style={{ color: "rgba(43,24,7,0.6)" }}>Time</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "rgba(43,24,7,0.6)" }}>Best: {getBest("memoryMatch")}</p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <button onClick={start} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-105" style={{ background: CHOCOLATE, color: CREAM }}>
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
              <Link href="/style-game" className="px-6 py-2.5 rounded-full text-sm font-semibold border transition-opacity hover:opacity-80" style={{ borderColor: BORDER, color: CHOCOLATE }}>
                Back to Studio
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
