import { prisma } from "@/lib/db"
import { refreshPublicData } from "@/lib/data"
import { requireAdmin } from "@/lib/auth"
import { sanitizeRichText } from "@/lib/sanitize"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    const body = await req.json()
    if (body.description) body.description = sanitizeRichText(body.description)
    const idea = await prisma.styleIdea.update({ where: { id }, data: body })
    refreshPublicData("style-ideas")
    return NextResponse.json({ success: true, message: "Style idea updated", statusCode: 200, data: idea })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update style idea", statusCode: 500 }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    await prisma.styleIdea.delete({ where: { id } })
    refreshPublicData("style-ideas")
    return NextResponse.json({ success: true, message: "Style idea deleted", statusCode: 200, data: null })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete style idea", statusCode: 500 }, { status: 500 })
  }
}
