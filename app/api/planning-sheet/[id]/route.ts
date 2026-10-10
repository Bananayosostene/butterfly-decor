import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { isObjectId } from "@/lib/data"
import { getPlanningSections } from "@/lib/planning-data"
import { cleanEntries, isDate, readEntries } from "@/lib/planning-sheet"
import { type NextRequest, NextResponse } from "next/server"

/** The admin edits a customer list and writes the price of each record. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    const stored = isObjectId(id) ? await prisma.planningSheet.findUnique({ where: { id }, select: { entries: true } }) : null
    if (!stored) return NextResponse.json({ success: false, message: "List not found", statusCode: 404 }, { status: 404 })

    const body = await req.json()
    const entries = cleanEntries(body?.entries, await getPlanningSections(), readEntries(stored.entries), true)
    await prisma.planningSheet.update({
      where: { id },
      data: { entries, weddingDate: isDate(body?.weddingDate) ? body.weddingDate : null },
    })
    return NextResponse.json({ success: true, message: "List saved", statusCode: 200, data: null })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to save the list", statusCode: 500 }, { status: 500 })
  }
}
