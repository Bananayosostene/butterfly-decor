import { unstable_cache, revalidateTag } from "next/cache"
import { prisma } from "@/lib/db"
import { DEFAULT_SECTIONS, readEntries, type SheetEntries, type SheetSection } from "@/lib/planning-sheet"

/** The two parts of the planning sheet as the admin set them (or the defaults), cached. */
export const getPlanningSections = unstable_cache(
  async (): Promise<SheetSection[]> => {
    const saved = await prisma.planningSection.findMany()
    return DEFAULT_SECTIONS.map((fallback) => {
      const s = saved.find((x) => x.key === fallback.key)
      if (!s) return fallback
      return {
        key: fallback.key,
        title: s.title,
        rowsLabel: s.rowsLabel,
        columns: s.columns.map((c) => ({ id: c.id, label: c.label, short: c.short })),
        rows: s.rows.map((r) => ({ id: r.id, label: r.label, imageUrl: r.imageUrl ?? null })),
      }
    })
  },
  ["planning-sections-v3"],
  { tags: ["planning-sheet"], revalidate: 60 * 60 },
)

export function refreshPlanningSections() {
  revalidateTag("planning-sheet", { expire: 0 })
}

/** What one customer has saved in their sheet. */
export async function getUserSheet(userId: string): Promise<{ weddingDate: string | null; entries: SheetEntries; submitted: boolean }> {
  const sheet = await prisma.planningSheet.findUnique({
    where: { userId },
    select: { weddingDate: true, entries: true, submittedAt: true },
  })
  return { weddingDate: sheet?.weddingDate ?? null, entries: readEntries(sheet?.entries), submitted: !!sheet?.submittedAt }
}
