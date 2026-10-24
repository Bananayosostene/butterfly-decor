/**
 * The wedding planning sheet: two parts (Introduction, Reception). Each part has two fixed
 * columns — "People / Item" and "Number" — and a list of rows the admin manages.
 *
 * This file has no database code, so client components can import it. The reads are in
 * lib/planning-data.ts.
 */

export const SECTION_KEYS = ["GUSABA", "RECEPTION"] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

/** A person or item the admin adds, e.g. "Umugeni (Bridal)". */
export type SheetRow = { id: string; label: string; imageUrl: string | null }
export type SheetSection = {
  key: SectionKey
  title: string
  rows: SheetRow[]
}

// Columns are fixed — always "People / Item" and "Number".
export type SheetColumn = { id: string; label: string; short: boolean }
export const FIXED_COLUMNS: SheetColumn[] = [
  { id: "item", label: "People / Item", short: false },
  { id: "count", label: "Number", short: true },
]

/** One record a customer added to a part of the sheet. */
export type SheetEntry = {
  id: string
  itemId: string
  label: string
  cells: Record<string, string>
  amount: number | null
}
export type SheetEntries = Record<SectionKey, SheetEntry[]>

export const CUSTOM_ITEM = "custom"
export const emptyEntry = (): SheetEntry => ({ id: newId(), itemId: "", label: "", cells: {}, amount: null })

export function withFirstRecord(entries: SheetEntries): SheetEntries {
  return {
    GUSABA: entries.GUSABA.length ? entries.GUSABA : [emptyEntry()],
    RECEPTION: entries.RECEPTION.length ? entries.RECEPTION : [emptyEntry()],
  }
}

export const sectionTotal = (entries: SheetEntry[]) => entries.reduce((sum, e) => sum + (e.amount ?? 0), 0)
export const sheetTotal = (entries: SheetEntries) => SECTION_KEYS.reduce((sum, key) => sum + sectionTotal(entries[key]), 0)
export const hasPrices = (entries: SheetEntries) => SECTION_KEYS.some((key) => entries[key].some((e) => e.amount !== null))
export const money = (amount: number) => `${amount.toLocaleString("en-US")} RWF`

export const MAX_ROWS = 40
const MAX_LABEL = 80
const MAX_VALUE = 200
const MAX_AMOUNT = 1_000_000_000
const ID = /^[a-z0-9]{2,16}$/

export const newId = () => Math.random().toString(36).slice(2, 10)

export const DEFAULT_SECTIONS: SheetSection[] = [
  { key: "GUSABA", title: "Gusaba no Gukwa", rows: [] },
  { key: "RECEPTION", title: "Reception", rows: [] },
]

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "")

/** Checks what the admin sent for one section. Returns null when it cannot be saved. */
export function cleanSection(body: any): Omit<SheetSection, "key"> & { rowsLabel: string; columns: SheetColumn[] } | null {
  const title = text(body?.title, MAX_LABEL)
  if (!title || !Array.isArray(body.rows)) return null
  if (body.rows.length > MAX_ROWS) return null

  const seen = new Set<string>()
  const fresh = (id: unknown) => typeof id === "string" && ID.test(id) && !seen.has(id) && !!seen.add(id)

  const cleanRows: SheetRow[] = []
  for (const r of body.rows) {
    const label = text(r?.label, MAX_LABEL)
    if (!label || !fresh(r.id)) return null
    const imageUrl = typeof r.imageUrl === "string" && r.imageUrl.startsWith("https://") ? r.imageUrl.slice(0, 500) : null
    cleanRows.push({ id: r.id, label, imageUrl })
  }
  // rowsLabel and columns are kept in the DB for backwards compatibility but are no longer
  // configurable — columns are always the two fixed ones.
  return { title, rows: cleanRows, rowsLabel: "People / Item", columns: FIXED_COLUMNS }
}

export function readEntries(stored: unknown): SheetEntries {
  const entries: SheetEntries = { GUSABA: [], RECEPTION: [] }
  for (const key of SECTION_KEYS) {
    const list = (stored as any)?.[key]
    if (!Array.isArray(list)) continue
    for (const e of list) {
      if (!e || typeof e.id !== "string") continue
      entries[key].push({
        id: e.id,
        itemId: typeof e.itemId === "string" ? e.itemId : "",
        label: typeof e.label === "string" ? e.label : "",
        cells: e.cells && typeof e.cells === "object" ? e.cells : {},
        amount: typeof e.amount === "number" ? e.amount : null,
      })
    }
  }
  return entries
}

export function cleanEntries(body: unknown, sections: SheetSection[], previous: SheetEntries, withAmounts: boolean): SheetEntries {
  const entries: SheetEntries = { GUSABA: [], RECEPTION: [] }
  const seen = new Set<string>()

  for (const section of sections) {
    const list = (body as any)?.[section.key]
    if (!Array.isArray(list)) continue
    const before = new Map(previous[section.key].map((e) => [e.id, e]))

    for (const raw of list.slice(0, MAX_ROWS)) {
      if (!raw || typeof raw.id !== "string" || !ID.test(raw.id) || seen.has(raw.id)) continue
      const old = before.get(raw.id)

      const option = section.rows.find((r) => r.id === raw.itemId)
      const own = raw.itemId === CUSTOM_ITEM ? text(raw.label, MAX_LABEL) : ""
      const itemId = option ? option.id : own ? CUSTOM_ITEM : old && old.itemId === raw.itemId && raw.itemId !== CUSTOM_ITEM ? old.itemId : ""
      const label = option ? option.label : own || (itemId ? old!.label : "")

      const cells: Record<string, string> = {}
      for (const col of FIXED_COLUMNS) {
        const value = text(raw.cells?.[col.id], MAX_VALUE)
        if (value) cells[col.id] = value
      }

      let amount = old?.amount ?? null
      if (withAmounts) {
        const n = typeof raw.amount === "number" ? Math.round(raw.amount) : NaN
        amount = Number.isFinite(n) && n >= 0 && n <= MAX_AMOUNT ? n : null
      }

      if (!itemId && !Object.keys(cells).length && amount === null) continue
      seen.add(raw.id)
      entries[section.key].push({ id: raw.id, itemId, label, cells, amount })
    }
  }
  return entries
}

export const isDate = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
