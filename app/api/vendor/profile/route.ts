import { prisma } from "@/lib/db"
import { isObjectId } from "@/lib/data"
import { getDashboardUser } from "@/lib/user-auth"
import { refreshVendors } from "@/lib/vendors"
import { type NextRequest, NextResponse } from "next/server"

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : undefined)

/** A vendor edits their own public profile. */
export async function PATCH(req: NextRequest) {
  try {
    const me = await getDashboardUser(req)
    if (me?.role !== "VENDOR")
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const businessName = text(body.businessName, 80)
    if (businessName !== undefined && !businessName)
      return NextResponse.json({ success: false, message: "Business name is required.", statusCode: 400 }, { status: 400 })

    const categoryId = typeof body.vendorCategoryId === "string" ? body.vendorCategoryId : undefined
    if (categoryId !== undefined && (!isObjectId(categoryId) || !(await prisma.vendorCategory.findUnique({ where: { id: categoryId }, select: { id: true } }))))
      return NextResponse.json({ success: false, message: "Unknown vendor category.", statusCode: 400 }, { status: 400 })

    await prisma.user.update({
      where: { id: me.id },
      data: {
        businessName,
        location: text(body.location, 80),
        phone: text(body.phone, 20),
        about: text(body.about, 2000),
        coverUrl: body.coverUrl === null ? null : text(body.coverUrl, 500),
        vendorCategoryId: categoryId,
      },
    })
    refreshVendors()
    return NextResponse.json({ success: true, message: "Profile saved", statusCode: 200 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to save profile", statusCode: 500 }, { status: 500 })
  }
}
