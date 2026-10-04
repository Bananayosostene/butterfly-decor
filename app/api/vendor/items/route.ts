import { prisma } from "@/lib/db"
import { getDashboardUser } from "@/lib/user-auth"
import { refreshVendors } from "@/lib/vendors"
import { type NextRequest, NextResponse } from "next/server"

/** A vendor adds a photo to their own gallery. */
export async function POST(req: NextRequest) {
  try {
    const me = await getDashboardUser(req)
    if (me?.role !== "VENDOR")
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : ""
    // Only images uploaded through our Cloudinary account are accepted.
    if (!imageUrl.startsWith("https://res.cloudinary.com/"))
      return NextResponse.json({ success: false, message: "Please upload an image.", statusCode: 400 }, { status: 400 })

    const item = await prisma.vendorItem.create({
      data: {
        vendorId: me.id,
        imageUrl,
        description: typeof body.description === "string" ? body.description.trim().slice(0, 500) : null,
      },
    })
    refreshVendors()
    return NextResponse.json({ success: true, message: "Item added", statusCode: 201, data: item }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to add item", statusCode: 500 }, { status: 500 })
  }
}
