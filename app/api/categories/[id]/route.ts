import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const category = await prisma.category.findUnique({ where: { id }, include: { items: true } })
    if (!category) return NextResponse.json({ success: false, message: "Category not found", statusCode: 404 }, { status: 404 })
    return NextResponse.json({ success: true, message: "Category fetched", statusCode: 200, data: category })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch category", statusCode: 500 }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: { name?: string; description?: string; imageUrl?: string } = {}
    if (body.name !== undefined) data.name = body.name
    if (body.description !== undefined) data.description = body.description
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl
    const category = await prisma.category.update({ where: { id }, data })
    return NextResponse.json({ success: true, message: "Category updated", statusCode: 200, data: category })
  } catch (error) {
    console.error("Failed to update category:", error)
    return NextResponse.json({ success: false, message: "Failed to update category", statusCode: 500 }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true, message: "Category deleted", statusCode: 200, data: null })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete category", statusCode: 500 }, { status: 500 })
  }
}
