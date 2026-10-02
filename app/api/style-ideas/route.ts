import { prisma } from "@/lib/db"
import { refreshPublicData } from "@/lib/data"
import { requireAdmin } from "@/lib/auth"
import { sanitizeRichText } from "@/lib/sanitize"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { title, description, imageUrl } = await req.json()
    if (!title || !imageUrl)
      return NextResponse.json({ success: false, message: "title and imageUrl are required", statusCode: 400 }, { status: 400 })
    const idea = await prisma.styleIdea.create({
      data: { title, description: description ? sanitizeRichText(description) : description, imageUrl },
    })
    refreshPublicData("style-ideas")
    return NextResponse.json({ success: true, message: "Style idea created", statusCode: 201, data: idea }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create style idea", statusCode: 500 }, { status: 500 })
  }
}
