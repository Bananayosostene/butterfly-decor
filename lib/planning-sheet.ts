/**
 * The wedding planning sheet: two parts (Introduction, Reception). In each part the customer
 * adds records one by one: they pick a person or item from the list the admin prepared and fill
 * in the columns. The admin later writes the price of each record.
 *
 * This file has no database code, so client components can import it. The reads are in
 * lib/planning-data.ts.
 */

export const SECTION_KEYS = ["GUSABA", "RECEPTION"] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export type SheetColumn = { id: string; label: string; short: boolean }
/** A person or item the customer can choose, e.g. "Umugeni". */
export type SheetRow = { id: string; label: string; imageUrl: string | null }
export type SheetSection = {
  key: SectionKey
  title: string
  /** Heading of the column where the person or item is chosen. */
  rowsLabel: string
  columns: SheetColumn[]
  rows: SheetRow[]
}

/** One record a customer added to a part of the sheet. */
export type SheetEntry = {
  id: string
  /** Id of the chosen person/item, CUSTOM_ITEM when they wrote their own, or "" when nothing is chosen yet. */
  itemId: string
  /** Name of the chosen person/item when it was saved (kept even if the admin later removes it). */
  label: string
  /** What was written in each column, keyed by column id. */
  cells: Record<string, string>
  /** Price in RWF, written by the admin only. */
  amount: number | null
}
export type SheetEntries = Record<SectionKey, SheetEntry[]>

/** `itemId` of a record whose person/item the customer wrote themselves (not on the admin's list). */
export const CUSTOM_ITEM = "custom"

export const emptyEntry = (): SheetEntry => ({ id: newId(), itemId: "", label: "", cells: {}, amount: null })

/** A sheet always shows at least one (empty) record per part. */
export function withFirstRecord(entries: SheetEntries): SheetEntries {
  return { GUSABA: entries.GUSABA.length ? entries.GUSABA : [emptyEntry()], RECEPTION: entries.RECEPTION.length ? entries.RECEPTION : [emptyEntry()] }
}

export const sectionTotal = (entries: SheetEntry[]) => entries.reduce((sum, e) => sum + (e.amount ?? 0), 0)
export const sheetTotal = (entries: SheetEntries) => SECTION_KEYS.reduce((sum, key) => sum + sectionTotal(entries[key]), 0)
export const hasPrices = (entries: SheetEntries) => SECTION_KEYS.some((key) => entries[key].some((e) => e.amount !== null))
export const money = (amount: number) => `${amount.toLocaleString("en-US")} RWF`

export const MAX_COLUMNS = 5
export const MAX_ROWS = 40
const MAX_LABEL = 80
const MAX_VALUE = 200
const MAX_AMOUNT = 1_000_000_000
const ID = /^[a-z0-9]{3,16}$/

export const newId = () => Math.random().toString(36).slice(2, 10)

const rows = (prefix: string, labels: string[]): SheetRow[] =>
  labels.map((label, i) => ({ id: `${prefix}${i + 1}`, label, imageUrl: null }))

/** Used until the admin saves their own version. */
export const DEFAULT_SECTIONS: SheetSection[] = [
  {
    key: "GUSABA",
    title: "List",
    rowsLabel: "People / Item",
    columns: [
      { id: "count", label: "Umubare", short: true },
    ],
    rows: rows("g", [
      "Umugeni",
      "Malene",
      "Umukwe",
      "Palen",
      "Abafille (bazambarira umugeni)",
      "Abasore (bazambarira umukwe)",
      "Mama (umugeni)",
      "Mama (umukwe)",
      "Jeunes mama",
    ]),
  },
  {
    key: "RECEPTION",
    title: "Reception",
    rowsLabel: "People / Item",
    columns: [
      { id: "count", label: "Umubare", short: true },
    ],
    rows: rows("r", ["Umugeni na malene", "Umukwe na palen", "Abafille", "Abasore", "Abana"]),
  },
]

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "")

/** Checks what the admin sent for one section. Returns null when it cannot be saved. */
export function cleanSection(body: any): Omit<SheetSection, "key"> | null {
  const title = text(body?.title, MAX_LABEL)
  const rowsLabel = text(body?.rowsLabel, MAX_LABEL)
  if (!title || !rowsLabel || !Array.isArray(body.columns) || !Array.isArray(body.rows)) return null
  if (body.columns.length > MAX_COLUMNS || body.rows.length > MAX_ROWS) return null

  const seen = new Set<string>()
  const fresh = (id: unknown) => typeof id === "string" && ID.test(id) && !seen.has(id) && !!seen.add(id)

  const columns: SheetColumn[] = []
  for (const c of body.columns) {
    const label = text(c?.label, MAX_LABEL)
    if (!label || !fresh(c.id)) return null
    columns.push({ id: c.id, label, short: c.short === true })
  }
  const cleanRows: SheetRow[] = []
  for (const r of body.rows) {
    const label = text(r?.label, MAX_LABEL)
    if (!label || !fresh(r.id)) return null
    const imageUrl = typeof r.imageUrl === "string" && r.imageUrl.startsWith("https://") ? r.imageUrl.slice(0, 500) : null
    cleanRows.push({ id: r.id, label, imageUrl })
  }
  if (!columns.length || !cleanRows.length) return null
  return { title, rowsLabel, columns, rows: cleanRows }
}

/** What is stored for a sheet, made safe to use (old or damaged data becomes empty lists). */
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

/**
 * Checks the records someone sent. Records with nothing in them are dropped. Prices are only
 * taken from the request when `withAmounts` is true (the admin); a customer's save keeps the
 * prices already stored.
 */
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

      // The chosen person/item must be on the admin's list, or be the one already saved.
      const option = section.rows.find((r) => r.id === raw.itemId)
      // ...or something the customer wrote themselves.
      const own = raw.itemId === CUSTOM_ITEM ? text(raw.label, MAX_LABEL) : ""
      const itemId = option ? option.id : own ? CUSTOM_ITEM : old && old.itemId === raw.itemId && raw.itemId !== CUSTOM_ITEM ? old.itemId : ""
      const label = option ? option.label : own || (itemId ? old!.label : "")

      const cells: Record<string, string> = {}
      for (const column of section.columns) {
        const value = text(raw.cells?.[column.id], MAX_VALUE)
        if (value) cells[column.id] = value
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
