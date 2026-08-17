import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { sanitizeRichText } from "@/lib/sanitize"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
      include: { images: { orderBy: { order: "asc" } } },
    })
    return NextResponse.json({ success: true, message: "Categories fetched", statusCode: 200, data: categories })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch categories", statusCode: 500 }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { name, description, imageUrl } = await req.json()
    if (!name) return NextResponse.json({ success: false, message: "Name is required", statusCode: 400 }, { status: 400 })
    const category = await prisma.category.create({
      data: { name, description: description ? sanitizeRichText(description) : description, imageUrl },
    })
    return NextResponse.json({ success: true, message: "Category created", statusCode: 201, data: category }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create category", statusCode: 500 }, { status: 500 })
  }
}
