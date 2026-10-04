import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { CATEGORY_ICON_FILES } from "@/lib/category-icons"
import { refreshVendors } from "@/lib/vendors"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    const body = await req.json()
    const data: { name?: string; icon?: string | null } = {}
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim()
    if (body.icon !== undefined) data.icon = CATEGORY_ICON_FILES.has(body.icon) ? body.icon : null

    const category = await prisma.vendorCategory.update({ where: { id }, data })
    refreshVendors()
    return NextResponse.json({ success: true, message: "Vendor category updated", statusCode: 200, data: category })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update vendor category", statusCode: 500 }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    // A category that vendors signed up under cannot simply disappear from their profiles.
    if (await prisma.user.count({ where: { vendorCategoryId: id } }))
      return NextResponse.json(
        { success: false, message: "Vendors are still using this category. Move them to another category first.", statusCode: 409 },
        { status: 409 },
      )
    await prisma.vendorCategory.delete({ where: { id } })
    refreshVendors()
    return NextResponse.json({ success: true, message: "Vendor category deleted", statusCode: 200, data: null })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete vendor category", statusCode: 500 }, { status: 500 })
  }
}
