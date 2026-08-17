"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sparkles, Check, X as XIcon, ArrowRight } from "lucide-react";
import {
  type HSL, hslToCss, harmonyScore, verdictForScore, tipForPair, generateSwatches, randomDesignerColor, type VerdictTier,
} from "@/lib/color-theory";

const CHOCOLATE = "#2b1807";
const GOLD = "#835105";
const CREAM = "#fdf6ee";
const BORDER = "#e8d5b7";

const TIER_STYLES: Record<VerdictTier, { bg: string; fg: string }> = {
  excellent: { bg: "#835105", fg: "#fdf6ee" },
  good: { bg: "#a97d3c", fg: "#fdf6ee" },
  meh: { bg: "#8a7658", fg: "#fdf6ee" },
  bad: { bg: "#7a3226", fg: "#fdf6ee" },
};

export type LayerDef<K extends string> = { id: K; label: string; hint: string };

export function LayeredBuilder<K extends string>({
  layers,
  renderComposite,
  onFinish,
  swatchCount = 5,
}: {
  layers: LayerDef<K>[];
  renderComposite: (colors: Partial<Record<K, HSL>>) => ReactNode;
  onFinish: (score: number, colors: Record<K, HSL>) => void;
  swatchCount?: number;
}) {
  const [layerIndex, setLayerIndex] = useState(0);
  const [colors, setColors] = useState<Partial<Record<K, HSL>>>({});
  const [anchor, setAnchor] = useState<HSL | null>(null);
  const [swatches, setSwatches] = useState<HSL[]>([]);
  const [phase, setPhase] = useState<"picking" | "revealed">("picking");
  const [totalScore, setTotalScore] = useState(0);
  const [roundResult, setRoundResult] = useState<{
    verdict: { label: string; tier: VerdictTier };
    tip: string;
    points: number;
  } | null>(null);

  const currentLayer = layers[layerIndex];
  const isAnchorLayer = layerIndex === 0;

  useEffect(() => {
    if (isAnchorLayer) {
      setSwatches(Array.from({ length: swatchCount }, () => randomDesignerColor()));
    } else if (anchor) {
      setSwatches(generateSwatches(anchor, swatchCount));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layerIndex, anchor]);

  function handlePick(swatch: HSL) {
    if (phase !== "picking") return;
    const nextColors = { ...colors, [currentLayer.id]: swatch };
    setColors(nextColors);

    if (isAnchorLayer) {
      setAnchor(swatch);
      setRoundResult({
        verdict: { label: "Foundation Set", tier: "excellent" },
        tip: "This color anchors the rest of your look — every other piece will play off it.",
        points: 50,
      });
      setTotalScore((s) => s + 50);
    } else {
      const s = harmonyScore(anchor!, swatch);
      const verdict = verdictForScore(s);
      const points = Math.round(s * 0.6);
      setRoundResult({ verdict, tip: tipForPair(anchor!, swatch), points });
      setTotalScore((prev) => prev + points);
    }
    setPhase("revealed");
  }

  function advance() {
    const next = layerIndex + 1;
    if (next >= layers.length) {
      onFinish(totalScore, colors as Record<K, HSL>);
      return;
    }
    setLayerIndex(next);
    setPhase("picking");
    setRoundResult(null);
  }

  const tierStyle = roundResult ? TIER_STYLES[roundResult.verdict.tier] : null;
  const TierIcon = roundResult?.verdict.tier === "bad" ? XIcon : roundResult?.verdict.tier === "excellent" ? Sparkles : Check;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>
          Step {layerIndex + 1} of {layers.length}
        </p>
        <p className="text-sm font-bold" style={{ color: CHOCOLATE }}>{totalScore} pts</p>
      </div>

      <div className="w-full h-1.5 rounded-full overflow-hidden mb-6" style={{ background: "rgba(43,24,7,0.1)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${((layerIndex + (phase === "revealed" ? 1 : 0.3)) / layers.length) * 100}%`, background: GOLD }}
        />
      </div>

      <div className="flex flex-col items-center gap-3 mb-6">
        <div
          className="relative"
          style={{
            width: 150,
            height: 190,
            transform: phase === "revealed" ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {renderComposite(colors)}
        </div>
        <p className="font-playball text-lg" style={{ color: CHOCOLATE }}>{currentLayer.label}</p>
        <p className="text-xs text-center max-w-xs" style={{ color: "rgba(43,24,7,0.6)" }}>{currentLayer.hint}</p>
      </div>

      {phase === "picking" ? (
        <div
          className="grid gap-3 justify-items-center max-w-xs mx-auto"
          style={{ gridTemplateColumns: `repeat(${swatches.length <= 4 ? swatches.length : 3}, minmax(0,1fr))` }}
        >
          {swatches.map((sw, i) => (
            <button
              key={i}
              onClick={() => handlePick(sw)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95 border-2"
              style={{ background: hslToCss(sw), borderColor: "rgba(255,255,255,0.6)" }}
              aria-label={`Swatch option ${i + 1}`}
            />
          ))}
        </div>
      ) : (
        roundResult && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: tierStyle?.bg, color: tierStyle?.fg }}>
              <TierIcon className="w-4 h-4" />
              {roundResult.verdict.label}
            </div>
            <p className="text-sm text-center max-w-sm" style={{ color: "rgba(43,24,7,0.75)" }}>{roundResult.tip}</p>
            <p className="text-xs font-bold" style={{ color: GOLD }}>+{roundResult.points} pts</p>
            <button
              onClick={advance}
              className="mt-1 flex items-center gap-1.5 px-6 py-2 rounded-full text-sm font-semibold transition-transform hover:scale-105"
              style={{ background: CHOCOLATE, color: CREAM }}
            >
              {layerIndex + 1 >= layers.length ? "See the Full Look" : "Next Piece"} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      )}
    </div>
  );
}

export { CHOCOLATE, GOLD, CREAM, BORDER };
