import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { CATEGORY_ICON_FILES } from "@/lib/category-icons"
import { refreshVendors } from "@/lib/vendors"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { name, icon } = await req.json()
    const cleanName = typeof name === "string" ? name.trim() : ""
    if (!cleanName) return NextResponse.json({ success: false, message: "Name is required", statusCode: 400 }, { status: 400 })

    const category = await prisma.vendorCategory.create({
      data: { name: cleanName, icon: CATEGORY_ICON_FILES.has(icon) ? icon : null },
    })
    refreshVendors()
    return NextResponse.json({ success: true, message: "Vendor category created", statusCode: 201, data: category }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create vendor category (the name may already exist)", statusCode: 500 }, { status: 500 })
  }
}
