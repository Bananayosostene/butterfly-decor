import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst()
    return NextResponse.json({
      success: true,
      message: "Settings fetched",
      statusCode: 200,
      data: { heroVideoUrl: settings?.heroVideoUrl ?? null },
    })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch settings", statusCode: 500 }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { heroVideoUrl } = await req.json()

    const existing = await prisma.siteSettings.findFirst()
    const settings = existing
      ? await prisma.siteSettings.update({ where: { id: existing.id }, data: { heroVideoUrl } })
      : await prisma.siteSettings.create({ data: { heroVideoUrl } })

    return NextResponse.json({ success: true, message: "Settings updated", statusCode: 200, data: { heroVideoUrl: settings.heroVideoUrl ?? null } })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update settings", statusCode: 500 }, { status: 500 })
  }
}
