import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

async function verifyAdminSession(req: NextRequest) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin_session")?.value
  return !!sessionToken
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await verifyAdminSession(req)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: body.status || undefined,
        adminNotes: body.adminNotes || undefined,
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}
