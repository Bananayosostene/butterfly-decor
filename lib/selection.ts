/** Browser-side store for the items a visitor has picked for a booking request. */

const IDS_KEY = "butterfly-selected-items";
const LABELS_KEY = "butterfly-selected-labels";

function read<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readSelectedIds(): string[] {
  return read<string[]>(IDS_KEY, []);
}

export function writeSelectedIds(ids: string[]) {
  localStorage.setItem(IDS_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("selectedItemsChange", { detail: ids.length }));
}

/** Category name per selected item, saved at selection time so the booking modal needs no lookup. */
export function readSelectedLabels(): Record<string, string> {
  return read<Record<string, string>>(LABELS_KEY, {});
}

export function rememberSelectedLabel(id: string, categoryName: string) {
  localStorage.setItem(LABELS_KEY, JSON.stringify({ ...readSelectedLabels(), [id]: categoryName }));
}
