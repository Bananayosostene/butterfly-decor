import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    const { imageUrl } = await req.json()
    if (!imageUrl) return NextResponse.json({ success: false, message: "imageUrl is required", statusCode: 400 }, { status: 400 })

    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) return NextResponse.json({ success: false, message: "Category not found", statusCode: 404 }, { status: 404 })

    const last = await prisma.categoryImage.findFirst({ where: { categoryId: id }, orderBy: { order: "desc" } })
    const image = await prisma.categoryImage.create({
      data: { categoryId: id, imageUrl, order: (last?.order ?? -1) + 1 },
    })
    return NextResponse.json({ success: true, message: "Image added", statusCode: 201, data: image }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to add image", statusCode: 500 }, { status: 500 })
  }
}
