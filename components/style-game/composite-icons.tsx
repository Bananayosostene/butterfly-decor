import { hslToCss, type HSL } from "@/lib/color-theory";

const NEUTRAL = "#d8d0c4";
const SKIN = "#e8c19c";
const HAIR = "#3b2412";

function fillOf(color?: HSL) {
  return color ? hslToCss(color) : NEUTRAL;
}

export type BrideLayer = "veil" | "gown" | "bouquet" | "shoes";
export type GroomLayer = "suit" | "tie" | "pocketSquare" | "shoes";
export type VenueLayer = "backdrop" | "runner" | "linen" | "centerpiece" | "chairSash";

export function BrideIcon({ colors, className }: { colors: Partial<Record<BrideLayer, HSL>>; className?: string }) {
  return (
    <svg viewBox="0 0 140 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M70 44 C40 50 30 90 34 150 C38 130 46 90 70 82 C94 90 102 130 106 150 C110 90 100 50 70 44 Z" fill={fillOf(colors.veil)} opacity="0.55" />
      <ellipse cx="52" cy="184" rx="9" ry="5" fill={fillOf(colors.shoes)} />
      <ellipse cx="88" cy="184" rx="9" ry="5" fill={fillOf(colors.shoes)} />
      <path d="M70 52 L36 76 L44 190 L96 190 L104 76 Z" fill={fillOf(colors.gown)} />
      <path d="M70 52 L60 70 L70 84 L80 70 Z" fill="#ffffff" opacity="0.5" />
      <circle cx="96" cy="132" r="10" fill={fillOf(colors.bouquet)} />
      <circle cx="86" cy="126" r="8" fill={fillOf(colors.bouquet)} opacity="0.85" />
      <circle cx="104" cy="126" r="8" fill={fillOf(colors.bouquet)} opacity="0.85" />
      <circle cx="70" cy="30" r="16" fill={SKIN} />
      <path d="M54 26 C54 12 86 12 86 26 C86 18 70 14 70 20 C70 14 54 18 54 26 Z" fill={HAIR} />
    </svg>
  );
}

export function GroomIcon({ colors, className }: { colors: Partial<Record<GroomLayer, HSL>>; className?: string }) {
  return (
    <svg viewBox="0 0 140 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="52" y="182" width="14" height="8" rx="2" fill={fillOf(colors.shoes)} />
      <rect x="74" y="182" width="14" height="8" rx="2" fill={fillOf(colors.shoes)} />
      <path d="M70 48 L34 68 L42 188 L98 188 L106 68 Z" fill={fillOf(colors.suit)} />
      <path d="M70 48 L52 76 L70 92 L60 58 Z" fill="#ffffff" opacity="0.55" />
      <path d="M70 48 L88 76 L70 92 L80 58 Z" fill="#ffffff" opacity="0.4" />
      <path d="M48 92 L58 100 L48 112 Z" fill={fillOf(colors.pocketSquare)} />
      <path d="M62 58 L70 66 L78 58 L74 50 L66 50 Z" fill={fillOf(colors.tie)} />
      <circle cx="70" cy="30" r="16" fill={SKIN} />
      <path d="M54 24 C54 10 86 10 86 24 L86 30 C80 20 60 20 54 30 Z" fill={HAIR} />
    </svg>
  );
}

export function VenueIcon({ colors, className }: { colors: Partial<Record<VenueLayer, HSL>>; className?: string }) {
  return (
    <svg viewBox="0 0 220 170" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M14 10 C50 60 36 110 14 150 L54 150 C66 100 60 50 68 10 Z" fill={fillOf(colors.backdrop)} />
      <path d="M206 10 C170 60 184 110 206 150 L166 150 C154 100 160 50 152 10 Z" fill={fillOf(colors.backdrop)} opacity="0.9" />
      <path d="M100 10 L120 10 L112 150 L108 150 Z" fill={fillOf(colors.runner)} opacity="0.8" />
      <ellipse cx="110" cy="128" rx="46" ry="14" fill={fillOf(colors.linen)} />
      <rect x="64" y="100" width="92" height="30" rx="4" fill={fillOf(colors.linen)} opacity="0.92" />
      <circle cx="110" cy="98" r="11" fill={fillOf(colors.centerpiece)} />
      <circle cx="98" cy="104" r="8" fill={fillOf(colors.centerpiece)} opacity="0.85" />
      <circle cx="122" cy="104" r="8" fill={fillOf(colors.centerpiece)} opacity="0.85" />
      <path d="M48 118 C40 112 40 100 50 100 C52 92 66 92 66 104 C66 114 56 120 48 118 Z" fill={fillOf(colors.chairSash)} />
      <path d="M172 118 C180 112 180 100 170 100 C168 92 154 92 154 104 C154 114 164 120 172 118 Z" fill={fillOf(colors.chairSash)} />
    </svg>
  );
}
