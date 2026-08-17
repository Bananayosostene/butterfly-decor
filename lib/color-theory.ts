export type HSL = { h: number; s: number; l: number };

export function hslToCss({ h, s, l }: HSL, alpha = 1): string {
  return alpha === 1 ? `hsl(${h} ${s}% ${l}%)` : `hsl(${h} ${s}% ${l}% / ${alpha})`;
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shortest angular distance between two hues, 0-180. */
export function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/** A tasteful "designer" color — never neon, never muddy. */
export function randomDesignerColor(): HSL {
  return {
    h: Math.floor(randomInRange(0, 360)),
    s: Math.round(randomInRange(35, 70)),
    l: Math.round(randomInRange(45, 68)),
  };
}

function colorNearOffset(base: HSL, offset: number, jitter: number): HSL {
  const h = (((base.h + offset + randomInRange(-jitter, jitter)) % 360) + 360) % 360;
  return { h, s: Math.round(randomInRange(35, 70)), l: Math.round(randomInRange(45, 68)) };
}

/**
 * Continuous 0-100 harmony score between two colors, built from gaussian
 * "bumps" centered on the classic color-wheel relationships (monochrome,
 * analogous, triadic, complementary), then softened by how far apart their
 * saturation/lightness sit — two hues can be theoretically compatible but
 * still clash if one is a pastel and the other is a jewel tone.
 */
export function harmonyScore(base: HSL, candidate: HSL): number {
  const d = hueDistance(base.h, candidate.h);
  const bump = (center: number, width: number, height: number) => {
    const dd = Math.min(Math.abs(d - center), Math.abs(d - center + 360), Math.abs(d - center - 360));
    return height * Math.exp(-(dd * dd) / (2 * width * width));
  };

  let score =
    bump(0, 18, 55) + // monochrome — calm, safe
    bump(30, 20, 78) + // analogous — soft, harmonious
    bump(120, 22, 85) + // triadic — playful, balanced
    bump(180, 24, 100); // complementary — bold, vivid

  score = Math.max(score, 12);

  const sDiff = Math.abs(base.s - candidate.s);
  const lDiff = Math.abs(base.l - candidate.l);
  const balancePenalty = Math.min(20, (sDiff + lDiff) * 0.15);

  return Math.round(Math.max(0, Math.min(100, score - balancePenalty)));
}

export type VerdictTier = "excellent" | "good" | "meh" | "bad";

export function verdictForScore(score: number): { label: string; tier: VerdictTier } {
  if (score >= 85) return { label: "Stunning Match!", tier: "excellent" };
  if (score >= 65) return { label: "Lovely Pairing", tier: "good" };
  if (score >= 45) return { label: "A Bit Off", tier: "meh" };
  return { label: "Clashing!", tier: "bad" };
}

export function tipForPair(base: HSL, candidate: HSL): string {
  const d = hueDistance(base.h, candidate.h);
  if (d < 18) return "Monochrome pairings feel calm and elegant — add texture so it doesn't go flat.";
  if (d < 45) return "Analogous colors sit close on the wheel: soft, harmonious, easy on the eye.";
  if (d < 100) return "This pairing sits in a tricky in-between zone — not close enough to blend, not far enough to pop.";
  if (d < 150) return "Triadic tones create playful contrast while staying balanced.";
  return "Complementary colors sit opposite the wheel — bold, vivid, full of contrast.";
}

/**
 * Builds a round's swatch set: one guaranteed excellent option, one
 * guaranteed poor option, and the rest random — so every round is
 * winnable but still asks a real question instead of hiding a trick.
 */
export function generateSwatches(base: HSL, count: number): HSL[] {
  const swatches: HSL[] = [colorNearOffset(base, 180, 8), colorNearOffset(base, 65, 10)];
  while (swatches.length < count) swatches.push(randomDesignerColor());
  return shuffle(swatches.slice(0, count));
}

/** A single, near-perfect complementary partner for a given base color. */
export function bestComplementFor(base: HSL): HSL {
  return colorNearOffset(base, 180, 6);
}

export function rankForScore(score: number): string {
  if (score >= 1100) return "Legendary Event Designer";
  if (score >= 750) return "Butterfly Stylist";
  if (score >= 450) return "Colour Curator";
  if (score >= 200) return "Rising Stylist";
  return "Curious Beginner";
}
