import { hslToCss, type HSL } from "@/lib/color-theory";

export type SceneId =
  | "bouquet"
  | "suit"
  | "tableSetting"
  | "giftBox"
  | "invitation"
  | "cake"
  | "backdrop"
  | "butterfly";

export const SCENES: { id: SceneId; label: string; hint: string; categorySlug: string }[] = [
  { id: "bouquet", label: "Bridal Bouquet", hint: "Pick a ribbon to wrap the stems.", categorySlug: "bridal" },
  { id: "suit", label: "Groom's Suit", hint: "Pick a bow-tie for the jacket.", categorySlug: "groom-suits" },
  { id: "tableSetting", label: "Reception Table", hint: "Pick a napkin for the place setting.", categorySlug: "decor" },
  { id: "giftBox", label: "Gift Wrapping", hint: "Pick a ribbon for the box.", categorySlug: "gift-wrapping" },
  { id: "invitation", label: "Wedding Invitation", hint: "Pick a wax seal for the card.", categorySlug: "invitations" },
  { id: "cake", label: "Celebration Cake", hint: "Pick a ribbon band for the tiers.", categorySlug: "decor" },
  { id: "backdrop", label: "Ceremony Backdrop", hint: "Pick a tie-back for the drape.", categorySlug: "decor" },
  { id: "butterfly", label: "Butterfly Finale", hint: "Pick a body color for the wings.", categorySlug: "decor" },
];

const NEUTRAL = "#d8d0c4";

function AccentFill({ color, fallback = NEUTRAL }: { color?: HSL; fallback?: string }) {
  return color ? hslToCss(color) : fallback;
}

export function SceneIcon({
  scene,
  base,
  accent,
  className,
}: {
  scene: SceneId;
  base: HSL;
  accent?: HSL;
  className?: string;
}) {
  const baseFill = hslToCss(base);
  const accentFill = AccentFill({ color: accent });
  const common = { className, viewBox: "0 0 120 120", xmlns: "http://www.w3.org/2000/svg" } as const;

  switch (scene) {
    case "bouquet":
      return (
        <svg {...common}>
          <path d="M60 118 L48 78 L72 78 Z" fill={accentFill} />
          <circle cx="60" cy="52" r="16" fill={baseFill} />
          <circle cx="40" cy="60" r="13" fill={baseFill} opacity="0.9" />
          <circle cx="80" cy="60" r="13" fill={baseFill} opacity="0.9" />
          <circle cx="48" cy="38" r="11" fill={baseFill} opacity="0.85" />
          <circle cx="72" cy="38" r="11" fill={baseFill} opacity="0.85" />
        </svg>
      );
    case "suit":
      return (
        <svg {...common}>
          <path d="M60 20 L20 40 L30 110 L90 110 L100 40 Z" fill={baseFill} />
          <path d="M60 20 L45 45 L60 60 L52 34 Z" fill="#fff" opacity="0.55" />
          <path d="M60 20 L75 45 L60 60 L68 34 Z" fill="#fff" opacity="0.4" />
          <path d="M50 48 L60 60 L70 48 L64 66 L56 66 Z" fill={accentFill} />
        </svg>
      );
    case "tableSetting":
      return (
        <svg {...common}>
          <circle cx="60" cy="60" r="46" fill={baseFill} />
          <circle cx="60" cy="60" r="34" fill="#fdf6ee" opacity="0.9" />
          <path d="M60 34 L82 60 L60 86 L38 60 Z" fill={accentFill} />
        </svg>
      );
    case "giftBox":
      return (
        <svg {...common}>
          <rect x="24" y="52" width="72" height="56" rx="6" fill={baseFill} />
          <rect x="18" y="34" width="84" height="20" rx="5" fill={baseFill} opacity="0.85" />
          <rect x="54" y="34" width="12" height="74" fill={accentFill} />
          <rect x="18" y="46" width="84" height="12" fill={accentFill} />
          <path d="M48 34 C40 18 20 20 30 34 Z" fill={accentFill} />
          <path d="M72 34 C80 18 100 20 90 34 Z" fill={accentFill} />
        </svg>
      );
    case "invitation":
      return (
        <svg {...common}>
          <rect x="16" y="30" width="88" height="62" rx="4" fill={baseFill} />
          <path d="M16 32 L60 66 L104 32" fill="none" stroke="#fdf6ee" strokeWidth="4" opacity="0.7" />
          <circle cx="60" cy="66" r="14" fill={accentFill} />
          <path d="M60 58 L64 66 L60 74 L56 66 Z" fill="#fdf6ee" opacity="0.6" />
        </svg>
      );
    case "cake":
      return (
        <svg {...common}>
          <path d="M30 108 L34 78 L86 78 L90 108 Z" fill={baseFill} />
          <path d="M38 78 L42 50 L78 50 L82 78 Z" fill={baseFill} opacity="0.85" />
          <rect x="26" y="72" width="68" height="10" fill={accentFill} />
          <rect x="36" y="46" width="48" height="8" fill={accentFill} />
          <rect x="57" y="26" width="6" height="20" fill={accentFill} />
          <circle cx="60" cy="22" r="6" fill={accentFill} />
        </svg>
      );
    case "backdrop":
      return (
        <svg {...common}>
          <path d="M10 16 C40 60 30 100 10 116 L48 116 C60 80 55 40 62 16 Z" fill={baseFill} />
          <path d="M110 16 C80 60 90 100 110 116 L72 116 C60 80 65 40 58 16 Z" fill={baseFill} opacity="0.85" />
          <circle cx="60" cy="60" r="14" fill={accentFill} />
          <path d="M60 46 L64 60 L60 74 L56 60 Z" fill="#fff" opacity="0.5" />
        </svg>
      );
    case "butterfly":
      return (
        <svg {...common}>
          <path d="M58 60 C40 20 8 26 14 54 C18 76 42 70 58 60 Z" fill={baseFill} />
          <path d="M62 60 C80 20 112 26 106 54 C102 76 78 70 62 60 Z" fill={baseFill} />
          <path d="M58 62 C42 96 16 96 22 76 C26 62 44 62 58 62 Z" fill={baseFill} opacity="0.85" />
          <path d="M62 62 C78 96 104 96 98 76 C94 62 76 62 62 62 Z" fill={baseFill} opacity="0.85" />
          <rect x="57" y="30" width="6" height="62" rx="3" fill={accentFill} />
          <circle cx="60" cy="28" r="5" fill={accentFill} />
        </svg>
      );
  }
}
