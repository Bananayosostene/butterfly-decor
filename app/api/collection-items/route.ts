import { prisma } from "@/lib/db"
import { refreshPublicData } from "@/lib/data"
import { requireAdmin } from "@/lib/auth"
import { sanitizeRichText } from "@/lib/sanitize"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { name, description, imageUrl, categoryId } = await req.json()
    if (!name || !imageUrl || !categoryId)
      return NextResponse.json({ success: false, message: "name, imageUrl and categoryId are required", statusCode: 400 }, { status: 400 })
    const item = await prisma.collectionItem.create({
      data: { name, description: description ? sanitizeRichText(description) : description, imageUrl, categoryId },
      include: { category: true },
    })
    refreshPublicData("collection-items")
    return NextResponse.json({ success: true, message: "Item created", statusCode: 201, data: item }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create item", statusCode: 500 }, { status: 500 })
  }
}
