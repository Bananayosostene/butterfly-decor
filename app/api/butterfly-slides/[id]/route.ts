import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { refreshPublicData } from "@/lib/data"
import { type NextRequest, NextResponse } from "next/server"

const isUpload = (url: unknown): url is string => typeof url === "string" && url.startsWith("https://res.cloudinary.com/")

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const data: { title?: string; leftImageUrl?: string; rightImageUrl?: string } = {}
    if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim().slice(0, 80)
    if (isUpload(body.leftImageUrl)) data.leftImageUrl = body.leftImageUrl
    if (isUpload(body.rightImageUrl)) data.rightImageUrl = body.rightImageUrl

    const slide = await prisma.butterflySlide.update({ where: { id }, data })
    refreshPublicData("settings")
    return NextResponse.json({ success: true, message: "Slide updated", statusCode: 200, data: slide })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update slide", statusCode: 500 }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    await prisma.butterflySlide.delete({ where: { id } })
    refreshPublicData("settings")
    return NextResponse.json({ success: true, message: "Slide deleted", statusCode: 200, data: null })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete slide", statusCode: 500 }, { status: 500 })
  }
}
