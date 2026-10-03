import { prisma } from "@/lib/db"
import { refreshPublicData } from "@/lib/data"
import { requireAdmin } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const body = await req.json()
    // Only the fields that were sent are changed, so each settings form can save on its own.
    const data: { heroVideoUrl?: string | null; decorImageUrl?: string | null } = {}
    if (body.heroVideoUrl !== undefined) data.heroVideoUrl = body.heroVideoUrl
    if (body.decorImageUrl !== undefined) data.decorImageUrl = body.decorImageUrl

    const existing = await prisma.siteSettings.findFirst()
    const settings = existing
      ? await prisma.siteSettings.update({ where: { id: existing.id }, data })
      : await prisma.siteSettings.create({ data })

    refreshPublicData("settings")
    return NextResponse.json({
      success: true,
      message: "Settings updated",
      statusCode: 200,
      data: { heroVideoUrl: settings.heroVideoUrl ?? null, decorImageUrl: settings.decorImageUrl ?? null },
    })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update settings", statusCode: 500 }, { status: 500 })
  }
}
