import { prisma } from "@/lib/db"
import { isObjectId } from "@/lib/data"
import { getDashboardUser, type DashboardUser } from "@/lib/user-auth"
import { refreshVendors } from "@/lib/vendors"
import { type NextRequest, NextResponse } from "next/server"

const deny = (message: string, status: number) =>
  NextResponse.json({ success: false, message, statusCode: status }, { status })

/** The item, if this dashboard user may change it: vendors only their own, the admin any. */
async function findEditableItem(id: string, me: DashboardUser) {
  if (!isObjectId(id)) return null
  const item = await prisma.vendorItem.findUnique({ where: { id }, select: { id: true, vendorId: true } })
  if (!item) return null
  return me.role === "ADMIN" || item.vendorId === me.id ? item : null
}

/** Vendors edit the photo and description of their own items; the admin switches items on or off. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getDashboardUser(req)
    if (!me) return deny("Unauthorized", 401)
    const { id } = await params
    if (!(await findEditableItem(id, me))) return deny("Item not found", 404)

    const body = await req.json().catch(() => ({}))
    const data: { imageUrl?: string; description?: string; active?: boolean } = {}
    if (me.role === "ADMIN") {
      if (typeof body.active === "boolean") data.active = body.active
    } else {
      if (typeof body.imageUrl === "string" && body.imageUrl.startsWith("https://res.cloudinary.com/")) data.imageUrl = body.imageUrl
      if (typeof body.description === "string") data.description = body.description.trim().slice(0, 500)
    }

    const item = await prisma.vendorItem.update({ where: { id }, data })
    refreshVendors()
    return NextResponse.json({ success: true, message: "Item updated", statusCode: 200, data: item })
  } catch {
    return deny("Failed to update item", 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getDashboardUser(req)
    if (!me) return deny("Unauthorized", 401)
    const { id } = await params
    if (!(await findEditableItem(id, me))) return deny("Item not found", 404)

    await prisma.vendorItem.delete({ where: { id } })
    refreshVendors()
    return NextResponse.json({ success: true, message: "Item deleted", statusCode: 200, data: null })
  } catch {
    return deny("Failed to delete item", 500)
  }
}
