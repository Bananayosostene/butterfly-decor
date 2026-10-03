/** Icons an admin can pick for a category. Files live in /public. */
export const CATEGORY_ICONS = [
  { file: "backdrop.svg", label: "Backdrop / stage" },
  { file: "bridal-shower.svg", label: "Bridal shower" },
  { file: "balloons.svg", label: "Birthday / balloons" },
  { file: "graduation.svg", label: "Graduation" },
  { file: "flowers.svg", label: "Flowers" },
  { file: "decor.svg", label: "Decor" },
  { file: "bridal.svg", label: "Bridal" },
  { file: "suits.svg", label: "Suits" },
  { file: "cake.svg", label: "Cake" },
  { file: "gift-box.svg", label: "Gift" },
  { file: "invitation.svg", label: "Invitation" },
] as const;

export const CATEGORY_ICON_FILES = new Set<string>(CATEGORY_ICONS.map((i) => i.file));

export const CATEGORY_KINDS = ["COLLECTION", "DECOR"] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

/** Icon for a category tab: the one the admin picked, otherwise a guess from the name. */
export function iconForCategory(name: string, icon?: string | null): string {
  if (icon && CATEGORY_ICON_FILES.has(icon)) return icon;
  const lower = name.toLowerCase();
  if (lower.includes("suit") || lower.includes("groom")) return "suits.svg";
  if (lower.includes("bridal") || lower.includes("bride")) return "bridal.svg";
  if (lower.includes("decor")) return "decor.svg";
  if (lower.includes("gift") || lower.includes("wrap")) return "gift-box.svg";
  if (lower.includes("invitation") || lower.includes("invite")) return "invitation.svg";
  return "cake.svg";
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/** The Decor tab of /collection; its decor categories are picked with `&decor=<category id>`. */
export const DECOR_SLUG = "decor";

export function decorHref(categoryId?: string) {
  return `/collection?cat=${DECOR_SLUG}${categoryId ? `&decor=${categoryId}` : ""}`;
}

/** Opens one item in the gallery popup; items have no page of their own. */
export function itemHref(itemId: string) {
  return `/collection?item=${itemId}`;
}

/**
 * Categories without a kind predate decor categories and belong to the main collection, except
 * the old catch-all "Decor" category, which now lives with the decor categories.
 */
export function kindOf(category: { kind?: string | null; name: string }): CategoryKind {
  return category.kind === "DECOR" || (!category.kind && category.name.trim().toLowerCase() === "decor") ? "DECOR" : "COLLECTION";
}

/** Where an item's category chip links to: its collection tab, or its decor filter. */
export function categoryHref(category: { id: string; name: string; kind?: string | null }) {
  return kindOf(category) === "DECOR" ? decorHref(category.id) : `/collection?cat=${slugify(category.name)}`;
}
