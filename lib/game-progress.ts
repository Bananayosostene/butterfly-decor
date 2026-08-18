export type GameMode = "paletteMatch" | "outfitBuilder" | "decorDesigner" | "memoryMatch";

const KEYS: Record<GameMode, string> = {
  paletteMatch: "butterfly-style-game-best", // legacy key, kept for continuity
  outfitBuilder: "butterfly-game-outfit-best",
  decorDesigner: "butterfly-game-decor-best",
  memoryMatch: "butterfly-game-memory-best",
};

export function getBest(mode: GameMode): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(KEYS[mode]) || 0);
}

export function saveBestIfHigher(mode: GameMode, score: number): boolean {
  if (typeof window === "undefined") return false;
  const current = getBest(mode);
  if (score > current) {
    localStorage.setItem(KEYS[mode], String(score));
    return true;
  }
  return false;
}

export function getAllBests(): Record<GameMode, number> {
  return {
    paletteMatch: getBest("paletteMatch"),
    outfitBuilder: getBest("outfitBuilder"),
    decorDesigner: getBest("decorDesigner"),
    memoryMatch: getBest("memoryMatch"),
  };
}

const BADGE_THRESHOLDS: Record<GameMode, { score: number; badge: string }[]> = {
  paletteMatch: [
    { score: 1, badge: "Color Curious" },
    { score: 400, badge: "Quick Eye" },
    { score: 900, badge: "Palette Pro" },
  ],
  outfitBuilder: [
    { score: 1, badge: "First Fitting" },
    { score: 260, badge: "Runway Ready" },
    { score: 420, badge: "Wardrobe Whisperer" },
  ],
  decorDesigner: [
    { score: 1, badge: "Venue Novice" },
    { score: 260, badge: "Room Stylist" },
    { score: 420, badge: "Venue Virtuoso" },
  ],
  memoryMatch: [
    { score: 1, badge: "Sharp Start" },
    { score: 500, badge: "Sharp Eye" },
    { score: 850, badge: "Memory Maven" },
  ],
};

export function badgesEarned(mode: GameMode, best: number): string[] {
  return BADGE_THRESHOLDS[mode].filter((t) => best >= t.score).map((t) => t.badge);
}

export function totalBadgeCount(bests: Record<GameMode, number>): number {
  return (Object.keys(bests) as GameMode[]).reduce((sum, m) => sum + badgesEarned(m, bests[m]).length, 0);
}

const STUDIO_TITLES = [
  { min: 0, title: "New to the Studio" },
  { min: 3, title: "Style Apprentice" },
  { min: 6, title: "Butterfly Stylist" },
  { min: 9, title: "Master of Ceremonies" },
  { min: 12, title: "Legendary Event Designer" },
];

export function studioTitle(totalBadges: number): string {
  let title = STUDIO_TITLES[0].title;
  for (const t of STUDIO_TITLES) if (totalBadges >= t.min) title = t.title;
  return title;
}
