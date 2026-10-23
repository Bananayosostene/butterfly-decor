import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { isObjectId } from "@/lib/data"
import { BOOKING_STATUSES } from "@/lib/bookings"
import { type NextRequest, NextResponse } from "next/server"

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 })

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req))) return unauthorized()
    const { id } = await params
    if (!isObjectId(id)) return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    const body = await req.json().catch(() => ({}))

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: BOOKING_STATUSES.includes(body.status) ? body.status : undefined,
        adminNotes: typeof body.adminNotes === "string" ? body.adminNotes.slice(0, 2000) : undefined,
      },
    })
    return NextResponse.json(booking)
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

/** One booking, for the admin only (it contains the customer's phone number). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req))) return unauthorized()
    const { id } = await params
    const booking = isObjectId(id) ? await prisma.booking.findUnique({ where: { id } }) : null
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    return NextResponse.json(booking)
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}
