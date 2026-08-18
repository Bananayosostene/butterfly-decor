"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Heart, Flame, Sparkles, Check, X as XIcon, Trophy, RotateCcw, Copy, ArrowRight, Gamepad2,
} from "lucide-react";
import {
  type HSL,
  hslToCss,
  harmonyScore,
  verdictForScore,
  tipForPair,
  generateSwatches,
  randomDesignerColor,
  rankForScore,
  type VerdictTier,
} from "@/lib/color-theory";
import { SceneIcon, SCENES, type SceneId } from "./scene-icon";
import { getBest, saveBestIfHigher } from "@/lib/game-progress";

const CHOCOLATE = "#2b1807";
const GOLD = "#835105";
const CREAM = "#fdf6ee";
const BORDER = "#e8d5b7";

const TOTAL_ROUNDS = 12;
const CHAPTER_SIZE = 4;

const CHAPTERS = [
  { title: "Getting Ready", subtitle: "Style the morning-of details before the big walk down the aisle." },
  { title: "The Ceremony", subtitle: "Set the scene for the vows." },
  { title: "The Reception", subtitle: "Bring the celebration to life." },
];

const ROUND_SCENES: SceneId[] = [
  "bouquet", "suit", "giftBox", "invitation",
  "backdrop", "tableSetting", "bouquet", "suit",
  "cake", "tableSetting", "giftBox", "butterfly",
];

function roundConfig(index: number) {
  const chapter = Math.floor(index / CHAPTER_SIZE);
  const isFinale = index === TOTAL_ROUNDS - 1;
  return {
    chapter,
    swatchCount: chapter === 0 ? 4 : chapter === 1 ? 5 : 6,
    timeLimit: chapter === 0 ? 8 : chapter === 1 ? 7 : isFinale ? 5 : 6,
    pointsMultiplier: isFinale ? 2 : 1,
    isFinale,
  };
}

const TIER_STYLES: Record<VerdictTier, { bg: string; fg: string; icon: typeof Check }> = {
  excellent: { bg: "#835105", fg: "#fdf6ee", icon: Sparkles },
  good: { bg: "#a97d3c", fg: "#fdf6ee", icon: Check },
  meh: { bg: "#8a7658", fg: "#fdf6ee", icon: Check },
  bad: { bg: "#7a3226", fg: "#fdf6ee", icon: XIcon },
};

type Phase = "intro" | "chapterIntro" | "playing" | "revealed" | "gameover";

type RoundResult = {
  score: number;
  verdict: { label: string; tier: VerdictTier };
  tip: string;
  pointsEarned: number;
  timedOut: boolean;
  heartsRemaining: number;
};

export function StyleMatchGame() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [copied, setCopied] = useState(false);

  const [base, setBase] = useState<HSL | null>(null);
  const [swatches, setSwatches] = useState<HSL[]>([]);
  const [timeLeft, setTimeLeft] = useState(8);
  const [picked, setPicked] = useState<HSL | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

  const heartsRef = useRef(hearts);
  heartsRef.current = hearts;
  const streakRef = useRef(streak);
  streakRef.current = streak;

  useEffect(() => {
    const saved = getBest("paletteMatch");
    if (saved > 0) setBestScore(saved);
  }, []);

  function beginRound(index: number) {
    const cfg = roundConfig(index);
    const newBase = randomDesignerColor();
    setBase(newBase);
    setSwatches(generateSwatches(newBase, cfg.swatchCount));
    setTimeLeft(cfg.timeLimit);
    setPicked(null);
    setRoundResult(null);
    setPhase("playing");
  }

  function startGame() {
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setHearts(3);
    setNewBest(false);
    setCopied(false);
    setRoundIndex(0);
    setPhase("chapterIntro");
  }

  function finishRound(swatch: HSL | null, s: number) {
    if (!base) return;
    const cfg = roundConfig(roundIndex);
    const verdict = verdictForScore(s);
    const isGood = verdict.tier === "excellent" || verdict.tier === "good";
    const isBad = verdict.tier === "bad" || !swatch;
    const nextStreak = swatch && isGood ? streakRef.current + 1 : 0;
    const multiplier = (1 + Math.min(streakRef.current, 10) * 0.2) * cfg.pointsMultiplier;
    const pointsEarned = swatch ? Math.round(s * multiplier) : 0;
    const heartsRemaining = isBad ? Math.max(0, heartsRef.current - 1) : heartsRef.current;

    setPicked(swatch);
    setScore((prev) => prev + pointsEarned);
    setStreak(nextStreak);
    setBestStreak((prev) => Math.max(prev, nextStreak));
    setHearts(heartsRemaining);
    setRoundResult({
      score: s,
      verdict,
      tip: swatch ? tipForPair(base, swatch) : "Too slow! Lock in your pick before the timer runs out next time.",
      pointsEarned,
      timedOut: !swatch,
      heartsRemaining,
    });
    setPhase("revealed");
  }

  function handlePick(swatch: HSL) {
    if (phase !== "playing" || !base) return;
    finishRound(swatch, harmonyScore(base, swatch));
  }

  function handleTimeout() {
    if (phase !== "playing") return;
    finishRound(null, 0);
  }

  function advance() {
    if (!roundResult) return;
    const next = roundIndex + 1;
    if (roundResult.heartsRemaining <= 0 || next >= TOTAL_ROUNDS) {
      endGame();
      return;
    }
    setRoundIndex(next);
    if (next % CHAPTER_SIZE === 0) {
      setPhase("chapterIntro");
    } else {
      beginRound(next);
    }
  }

  function endGame() {
    setPhase("gameover");
    const isNew = saveBestIfHigher("paletteMatch", score);
    setNewBest(isNew);
    setBestScore(isNew ? score : getBest("paletteMatch"));
  }

  // Round timer
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => Math.round((v - 0.1) * 10) / 10), 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  // Chapter intro auto-advance
  useEffect(() => {
    if (phase !== "chapterIntro") return;
    const t = setTimeout(() => beginRound(roundIndex), 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIndex]);

  // Reveal auto-advance
  useEffect(() => {
    if (phase !== "revealed") return;
    const t = setTimeout(() => advance(), 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundResult]);

  const handleCopyResult = async () => {
    const rank = rankForScore(score);
    const text = `I scored ${score} points and became a "${rank}" on Butterfly Decor's Style Match game! 🦋 Can you beat me? ${typeof window !== "undefined" ? window.location.origin : ""}/style-game`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // clipboard unavailable — silently ignore, non-critical
    }
  };

  const openBooking = () => window.dispatchEvent(new CustomEvent("openBookingModal"));

  return (
    <section className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10" style={{ background: "linear-gradient(160deg, #F5F5F7 0%, #efe6d8 100%)" }}>
      <div
        className="w-full max-w-xl rounded-3xl shadow-xl overflow-hidden"
        style={{ background: CREAM, border: `1.5px solid ${BORDER}` }}
      >
        {phase === "intro" && <IntroPanel bestScore={bestScore} onStart={startGame} />}

        {phase === "chapterIntro" && (
          <ChapterIntroPanel
            chapter={CHAPTERS[Math.floor(roundIndex / CHAPTER_SIZE)]}
            chapterNumber={Math.floor(roundIndex / CHAPTER_SIZE) + 1}
            roundIndex={roundIndex}
            onSkip={() => beginRound(roundIndex)}
          />
        )}

        {(phase === "playing" || phase === "revealed") && base && (
          <PlayingPanel
            phase={phase}
            roundIndex={roundIndex}
            hearts={hearts}
            score={score}
            streak={streak}
            base={base}
            swatches={swatches}
            picked={picked}
            timeLeft={timeLeft}
            roundResult={roundResult}
            onPick={handlePick}
            onContinue={advance}
          />
        )}

        {phase === "gameover" && (
          <GameOverPanel
            score={score}
            bestScore={bestScore}
            bestStreak={bestStreak}
            newBest={newBest}
            copied={copied}
            onCopy={handleCopyResult}
            onPlayAgain={startGame}
            onBook={openBooking}
          />
        )}
      </div>
    </section>
  );
}

function IntroPanel({ bestScore, onStart }: { bestScore: number; onStart: () => void }) {
  return (
    <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-5">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: CHOCOLATE }}>
        <Gamepad2 className="w-8 h-8" style={{ color: CREAM }} />
      </div>
      <h1 className="text-3xl sm:text-4xl font-playball" style={{ color: CHOCOLATE }}>
        Style Match
      </h1>
      <p className="text-sm sm:text-base leading-relaxed max-w-md" style={{ color: "rgba(43,24,7,0.75)" }}>
        Think you have a stylist&apos;s eye? Pair colors across 12 real Butterfly Decor moments —
        from the morning bouquet to the reception cake — and see how sharp your instincts really are.
      </p>

      {bestScore > 0 && (
        <p className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "rgba(131,81,5,0.12)", color: GOLD }}>
          Your best score: {bestScore} · {rankForScore(bestScore)}
        </p>
      )}

      <div className="w-full text-left flex flex-col gap-2 mt-1 max-w-sm">
        {[
          "Pick the swatch that pairs best with the base color",
          "Beat the clock — rounds get faster as you progress",
          "Chain great picks in a row for a score multiplier",
        ].map((rule, i) => (
          <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "rgba(43,24,7,0.75)" }}>
            <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: BORDER, color: CHOCOLATE }}>
              {i + 1}
            </span>
            {rule}
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="mt-2 flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-transform hover:scale-105"
        style={{ background: CHOCOLATE, color: CREAM }}
      >
        Start Styling <ArrowRight className="w-4 h-4" />
      </button>
      <Link href="/collection" className="text-xs underline" style={{ color: "rgba(43,24,7,0.55)" }}>
        Skip the game, explore real collections →
      </Link>
    </div>
  );
}

function ChapterIntroPanel({
  chapter,
  chapterNumber,
  roundIndex,
  onSkip,
}: {
  chapter: { title: string; subtitle: string };
  chapterNumber: number;
  roundIndex: number;
  onSkip: () => void;
}) {
  return (
    <div className="p-10 sm:p-14 flex flex-col items-center text-center gap-3 min-h-[380px] justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
        Chapter {chapterNumber} of 3 · Round {roundIndex + 1} of {TOTAL_ROUNDS}
      </p>
      <h2 className="text-2xl sm:text-3xl font-playball" style={{ color: CHOCOLATE }}>
        {chapter.title}
      </h2>
      <p className="text-sm max-w-xs" style={{ color: "rgba(43,24,7,0.7)" }}>
        {chapter.subtitle}
      </p>
      <button
        onClick={onSkip}
        className="mt-3 px-6 py-2 rounded-full text-sm font-medium border transition-opacity hover:opacity-80"
        style={{ borderColor: BORDER, color: CHOCOLATE }}
      >
        Continue
      </button>
    </div>
  );
}

function PlayingPanel({
  phase,
  roundIndex,
  hearts,
  score,
  streak,
  base,
  swatches,
  picked,
  timeLeft,
  roundResult,
  onPick,
  onContinue,
}: {
  phase: "playing" | "revealed";
  roundIndex: number;
  hearts: number;
  score: number;
  streak: number;
  base: HSL;
  swatches: HSL[];
  picked: HSL | null;
  timeLeft: number;
  roundResult: RoundResult | null;
  onPick: (s: HSL) => void;
  onContinue: () => void;
}) {
  const cfg = roundConfig(roundIndex);
  const scene = SCENES.find((s) => s.id === ROUND_SCENES[roundIndex])!;
  const timePct = Math.max(0, (timeLeft / cfg.timeLimit) * 100);
  const timeColor = timePct > 50 ? GOLD : timePct > 20 ? "#c07a2b" : "#a4392a";
  const revealed = phase === "revealed";
  const tier = roundResult?.verdict.tier;
  const tierStyle = tier ? TIER_STYLES[tier] : null;
  const TierIcon = tierStyle?.icon ?? Check;

  return (
    <div className="p-6 sm:p-8">
      {/* HUD */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className="w-4 h-4 transition-all duration-300"
              style={{ color: i < hearts ? "#a4392a" : "rgba(43,24,7,0.2)" }}
              fill={i < hearts ? "#a4392a" : "none"}
            />
          ))}
        </div>
        <p className="text-xs font-semibold" style={{ color: "rgba(43,24,7,0.6)" }}>
          Round {roundIndex + 1} / {TOTAL_ROUNDS}
        </p>
        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <span className="flex items-center gap-0.5 text-xs font-bold" style={{ color: "#c07a2b" }}>
              <Flame className="w-3.5 h-3.5" /> x{Math.min(1 + streak * 0.2, 3).toFixed(1)}
            </span>
          )}
          <span className="text-sm font-bold" style={{ color: CHOCOLATE }}>{score} pts</span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden mb-6" style={{ background: "rgba(43,24,7,0.1)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${revealed ? 100 : timePct}%`, background: revealed ? (tierStyle?.bg ?? GOLD) : timeColor, transition: "width 0.1s linear, background 0.3s ease" }}
        />
      </div>

      {/* Scene */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div
          className="relative"
          style={{
            width: 140,
            height: 140,
            transform: revealed ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <SceneIcon scene={scene.id} base={base} accent={picked ?? undefined} className="w-full h-full drop-shadow-md" />
        </div>
        <p className="font-playball text-lg" style={{ color: CHOCOLATE }}>{scene.label}</p>
        <p className="text-xs" style={{ color: "rgba(43,24,7,0.6)" }}>{scene.hint}</p>
      </div>

      {/* Swatches or result */}
      {!revealed ? (
        <div
          className="grid gap-3 justify-items-center max-w-xs mx-auto"
          style={{ gridTemplateColumns: `repeat(${swatches.length <= 4 ? swatches.length : 3}, minmax(0,1fr))` }}
        >
          {swatches.map((sw, i) => (
            <button
              key={i}
              onClick={() => onPick(sw)}
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
              {roundResult.timedOut ? "Time's Up!" : roundResult.verdict.label}
            </div>
            <p className="text-sm text-center max-w-sm" style={{ color: "rgba(43,24,7,0.75)" }}>
              {roundResult.tip}
            </p>
            {roundResult.pointsEarned > 0 && (
              <p className="text-xs font-bold" style={{ color: GOLD }}>+{roundResult.pointsEarned} pts</p>
            )}
            <button
              onClick={onContinue}
              className="mt-1 px-6 py-2 rounded-full text-sm font-semibold transition-transform hover:scale-105"
              style={{ background: CHOCOLATE, color: CREAM }}
            >
              Continue
            </button>
          </div>
        )
      )}
    </div>
  );
}

function GameOverPanel({
  score,
  bestScore,
  bestStreak,
  newBest,
  copied,
  onCopy,
  onPlayAgain,
  onBook,
}: {
  score: number;
  bestScore: number;
  bestStreak: number;
  newBest: boolean;
  copied: boolean;
  onCopy: () => void;
  onPlayAgain: () => void;
  onBook: () => void;
}) {
  const rank = rankForScore(score);
  return (
    <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: GOLD }}>
        <Trophy className="w-8 h-8" style={{ color: CREAM }} />
      </div>
      {newBest && (
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(131,81,5,0.15)", color: GOLD }}>
          ✨ New personal best!
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-playball" style={{ color: CHOCOLATE }}>{rank}</h2>
      <div className="flex items-center gap-6">
        <div>
          <p className="text-2xl font-bold" style={{ color: CHOCOLATE }}>{score}</p>
          <p className="text-xs" style={{ color: "rgba(43,24,7,0.6)" }}>Final score</p>
        </div>
        <div className="w-px h-8" style={{ background: BORDER }} />
        <div>
          <p className="text-2xl font-bold" style={{ color: CHOCOLATE }}>{bestStreak}</p>
          <p className="text-xs" style={{ color: "rgba(43,24,7,0.6)" }}>Best streak</p>
        </div>
        <div className="w-px h-8" style={{ background: BORDER }} />
        <div>
          <p className="text-2xl font-bold" style={{ color: CHOCOLATE }}>{bestScore}</p>
          <p className="text-xs" style={{ color: "rgba(43,24,7,0.6)" }}>All-time best</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
        <button
          onClick={onPlayAgain}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-105"
          style={{ background: CHOCOLATE, color: CREAM }}
        >
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
        <button
          onClick={onCopy}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold border transition-opacity hover:opacity-80"
          style={{ borderColor: BORDER, color: CHOCOLATE }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy My Result"}
        </button>
        <Link
          href="/style-game"
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold border transition-opacity hover:opacity-80"
          style={{ borderColor: BORDER, color: CHOCOLATE }}
        >
          Back to Studio
        </Link>
      </div>

      <div className="w-full border-t mt-2 pt-5 flex flex-col items-center gap-2" style={{ borderColor: BORDER }}>
        <p className="text-sm" style={{ color: "rgba(43,24,7,0.7)" }}>Loved playing with color?</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/collection" className="text-sm font-medium underline" style={{ color: GOLD }}>
            Explore real collections →
          </Link>
          <button onClick={onBook} className="text-sm font-medium underline" style={{ color: GOLD }}>
            Let&apos;s style your real event →
          </button>
        </div>
      </div>
    </div>
  );
}
