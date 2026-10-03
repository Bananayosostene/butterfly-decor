import { prisma } from "@/lib/db"
import { refreshPublicData } from "@/lib/data"
import { requireAdmin } from "@/lib/auth"
import { CATEGORY_ICON_FILES } from "@/lib/category-icons"
import { sanitizeRichText } from "@/lib/sanitize"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { name, description, imageUrl, kind, icon } = await req.json()
    if (!name) return NextResponse.json({ success: false, message: "Name is required", statusCode: 400 }, { status: 400 })
    const category = await prisma.category.create({
      data: {
        name,
        description: description ? sanitizeRichText(description) : description,
        imageUrl,
        kind: kind === "DECOR" ? "DECOR" : "COLLECTION",
        icon: CATEGORY_ICON_FILES.has(icon) ? icon : null,
      },
    })
    refreshPublicData("categories")
    return NextResponse.json({ success: true, message: "Category created", statusCode: 201, data: category }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create category", statusCode: 500 }, { status: 500 })
  }
}
