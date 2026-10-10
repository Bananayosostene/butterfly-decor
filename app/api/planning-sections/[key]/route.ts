import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { refreshPlanningSections } from "@/lib/planning-data"
import { SECTION_KEYS, cleanSection, type SectionKey } from "@/lib/planning-sheet"
import { type NextRequest, NextResponse } from "next/server"

/** The admin saves one part of the planning sheet (its title, columns and rows) in one go. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { key } = await params
    if (!SECTION_KEYS.includes(key as SectionKey))
      return NextResponse.json({ success: false, message: "Unknown part of the sheet", statusCode: 404 }, { status: 404 })

    const data = cleanSection(await req.json())
    if (!data)
      return NextResponse.json(
        { success: false, message: "Every column and row needs a name, and the sheet needs at least one of each.", statusCode: 400 },
        { status: 400 },
      )

    await prisma.planningSection.upsert({ where: { key }, create: { key, ...data }, update: data })
    refreshPlanningSections()
    return NextResponse.json({ success: true, message: "Planning sheet saved", statusCode: 200, data: null })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to save the planning sheet", statusCode: 500 }, { status: 500 })
  }
}
