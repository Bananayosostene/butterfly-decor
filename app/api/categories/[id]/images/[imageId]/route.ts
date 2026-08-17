import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id, imageId } = await params
    await prisma.categoryImage.deleteMany({ where: { id: imageId, categoryId: id } })
    return NextResponse.json({ success: true, message: "Image deleted", statusCode: 200, data: null })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete image", statusCode: 500 }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id, imageId } = await params
    const { direction } = await req.json()
    if (direction !== "up" && direction !== "down")
      return NextResponse.json({ success: false, message: "direction must be 'up' or 'down'", statusCode: 400 }, { status: 400 })

    const images = await prisma.categoryImage.findMany({ where: { categoryId: id }, orderBy: { order: "asc" } })
    const index = images.findIndex((img) => img.id === imageId)
    if (index === -1) return NextResponse.json({ success: false, message: "Image not found", statusCode: 404 }, { status: 404 })

    const swapIndex = direction === "up" ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= images.length) {
      return NextResponse.json({ success: true, message: "No change", statusCode: 200, data: images })
    }

    const current = images[index]
    const swap = images[swapIndex]
    await prisma.$transaction([
      prisma.categoryImage.update({ where: { id: current.id }, data: { order: swap.order } }),
      prisma.categoryImage.update({ where: { id: swap.id }, data: { order: current.order } }),
    ])

    const updated = await prisma.categoryImage.findMany({ where: { categoryId: id }, orderBy: { order: "asc" } })
    return NextResponse.json({ success: true, message: "Reordered", statusCode: 200, data: updated })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to reorder image", statusCode: 500 }, { status: 500 })
  }
}
