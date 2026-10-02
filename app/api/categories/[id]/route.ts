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
    const data: { name?: string; description?: string; imageUrl?: string } = {}
    if (body.name !== undefined) data.name = body.name
    if (body.description !== undefined) data.description = body.description ? sanitizeRichText(body.description) : body.description
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl
    const category = await prisma.category.update({ where: { id }, data })
    refreshPublicData("categories")
    return NextResponse.json({ success: true, message: "Category updated", statusCode: 200, data: category })
  } catch (error) {
    console.error("Failed to update category:", error)
    return NextResponse.json({ success: false, message: "Failed to update category", statusCode: 500 }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    await prisma.categoryImage.deleteMany({ where: { categoryId: id } })
    await prisma.category.delete({ where: { id } })
    refreshPublicData("categories")
    return NextResponse.json({ success: true, message: "Category deleted", statusCode: 200, data: null })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete category", statusCode: 500 }, { status: 500 })
  }
}
